import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// =====================================================
// SIMPLE FRAUD DETECTION
// If ANY rule triggered → FRAUD (status = "fraud")
// =====================================================

interface FraudFlag {
  flag: string;
  reason: string;
  category: string;
}

async function detectFraud(
  supabase: any,
  submission: {
    customer_phone: string;
    customer_name: string;
    customer_email?: string;
    campaign_id: string;
    device_info?: string;
    device_fingerprint_hash?: string;
    gps_lat?: string;
    gps_lng?: string;
    ip_address?: string;
    screenshot_download?: boolean;
    screenshot_register?: boolean;
    screenshot_rating?: boolean;
    evidence_hashes?: string[];
    evidence_types?: string[];
    time_on_page_ms?: number;
    typing_speeds?: number[];
  },
  fraudRules: any
): Promise<{ flags: FraudFlag[]; is_fraud: boolean }> {
  const flags: FraudFlag[] = [];

  // 1. MISSING EVIDENCE
  if (fraudRules.require_screenshot_download && !submission.screenshot_download) {
    flags.push({ flag: "MISSING_DOWNLOAD", reason: "Screenshot Download belum diupload", category: "evidence" });
  }
  if (fraudRules.require_screenshot_register && !submission.screenshot_register) {
    flags.push({ flag: "MISSING_REGISTER", reason: "Screenshot Registrasi belum diupload", category: "evidence" });
  }
  if (fraudRules.require_screenshot_rating && !submission.screenshot_rating) {
    flags.push({ flag: "MISSING_RATING", reason: "Screenshot Rating & Review belum diupload", category: "evidence" });
  }

  // 2. DUPLICATE SCREENSHOTS
  if (submission.evidence_hashes && submission.evidence_hashes.length > 1) {
    const hashes = submission.evidence_hashes;
    const types = submission.evidence_types || [];
    const validHashes: string[] = [];

    for (const h of hashes) {
      if (h && h !== 'pending') validHashes.push(h);
    }

    if (validHashes.length >= 2) {
      const hashSet = new Set(validHashes);
      if (hashSet.size === 1 && validHashes.length >= 3) {
        const typeLabels = types.map(t => {
          if (t.includes('download')) return 'Screenshot Download';
          if (t.includes('register')) return 'Screenshot Registrasi';
          if (t.includes('rating')) return 'Rating & Review';
          return t;
        }).join(', ');
        flags.push({
          flag: "IDENTICAL_SCREENSHOTS",
          reason: `FRAUD: Foto IDENTIK untuk SEMUA evidence (${typeLabels}). Kemungkinan screenshot 1 layar yang sama.`,
          category: "evidence"
        });
      } else if (hashSet.size < validHashes.length) {
        flags.push({
          flag: "DUPLICATE_SCREENSHOTS",
          reason: "FRAUD: Ada foto yang sama digunakan untuk evidence berbeda.",
          category: "evidence"
        });
      }
    }
  }

  // 3. NO GPS
  if (fraudRules.require_gps && (!submission.gps_lat || !submission.gps_lng)) {
    flags.push({ flag: "NO_GPS", reason: "Data GPS tidak tersedia", category: "location" });
  }

  // 4. BOT BEHAVIOR
  if (submission.time_on_page_ms !== undefined && submission.time_on_page_ms < 3000) {
    flags.push({ flag: "BOT_FAST", reason: `Waktu di halaman hanya ${submission.time_on_page_ms}ms (kemungkinan bot)`, category: "behavior" });
  }

  if (submission.typing_speeds && submission.typing_speeds.length > 0) {
    const avgSpeed = submission.typing_speeds.reduce((a, b) => a + b, 0) / submission.typing_speeds.length;
    if (avgSpeed > 20) {
      flags.push({ flag: "BOT_TYPING", reason: `Typing speed ${avgSpeed.toFixed(1)} cps (kemungkinan bot)`, category: "behavior" });
    }
  }

  // 5. DUPLICATE PHONE
  if (fraudRules.check_duplicate_phone && submission.customer_phone) {
    const { data: dupPhone } = await supabase
      .from("submissions")
      .select("id, submission_code")
      .eq("customer_phone", submission.customer_phone)
      .eq("campaign_id", submission.campaign_id)
      .limit(1);

    if (dupPhone && dupPhone.length > 0) {
      flags.push({
        flag: "DUPLICATE_PHONE",
        reason: `FRAUD: HP '${submission.customer_phone}' sudah terdaftar (${dupPhone[0].submission_code})`,
        category: "customer"
      });
    }
  }

  // 6. DUPLICATE NAME
  if (fraudRules.check_duplicate_name && submission.customer_name) {
    const { data: dupName } = await supabase
      .from("submissions")
      .select("id, submission_code, customer_phone")
      .eq("campaign_id", submission.campaign_id)
      .ilike("customer_name", submission.customer_name.toLowerCase().trim())
      .neq("customer_phone", submission.customer_phone)
      .limit(1);

    if (dupName && dupName.length > 0) {
      flags.push({
        flag: "DUPLICATE_NAME",
        reason: `FRAUD: Nama '${submission.customer_name}' sudah terdaftar dengan HP berbeda`,
        category: "customer"
      });
    }
  }

  // 7. DUPLICATE EMAIL
  if (fraudRules.check_duplicate_email && submission.customer_email) {
    const { data: dupEmail } = await supabase
      .from("submissions")
      .select("id, submission_code")
      .eq("customer_email", submission.customer_email)
      .eq("campaign_id", submission.campaign_id)
      .not("customer_email", "is", null)
      .limit(1);

    if (dupEmail && dupEmail.length > 0) {
      flags.push({
        flag: "DUPLICATE_EMAIL",
        reason: `FRAUD: Email '${submission.customer_email}' sudah terdaftar`,
        category: "customer"
      });
    }
  }

  // 8. DUPLICATE IP
  if (fraudRules.check_duplicate_ip && submission.ip_address) {
    const { data: dupIp } = await supabase
      .from("submissions")
      .select("id, customer_name, customer_phone")
      .eq("ip_address", submission.ip_address)
      .eq("campaign_id", submission.campaign_id)
      .neq("customer_name", submission.customer_name)
      .limit(3);

    if (dupIp && dupIp.length > 0) {
      const uniquePhones = [...new Set(dupIp.map((s: any) => s.customer_phone))];
      flags.push({
        flag: "DUPLICATE_IP",
        reason: `FRAUD: IP '${submission.ip_address}' digunakan untuk ${uniquePhones.length + 1} customer berbeda`,
        category: "device"
      });
    }
  }

  // 9. DEVICE FARM
  if (fraudRules.check_duplicate_device && submission.device_info) {
    const deviceField = submission.device_fingerprint_hash ? "device_fingerprint_hash" : "device_info";
    const deviceValue = submission.device_fingerprint_hash || submission.device_info;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: deviceFarm } = await supabase
      .from("submissions")
      .select("id, customer_phone")
      .eq(deviceField, deviceValue)
      .eq("campaign_id", submission.campaign_id)
      .neq("customer_phone", submission.customer_phone)
      .gte("created_at", oneDayAgo);

    if (deviceFarm && deviceFarm.length > 0) {
      const uniquePhones = [...new Set(deviceFarm.map((s: any) => s.customer_phone))];
      if (uniquePhones.length >= 2) {
        flags.push({
          flag: "DEVICE_FARM",
          reason: `FRAUD: Device digunakan untuk ${uniquePhones.length + 1} HP berbeda dalam 24 jam`,
          category: "device"
        });
      }
    }
  }

  // 10. SUBMISSION VELOCITY
  if (fraudRules.check_submission_velocity && fraudRules.min_seconds_between_submissions > 0) {
    const { data: lastSubmission } = await supabase
      .from("submissions")
      .select("created_at")
      .eq("campaign_id", submission.campaign_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastSubmission) {
      const diffSeconds = (Date.now() - new Date(lastSubmission.created_at).getTime()) / 1000;
      if (diffSeconds < fraudRules.min_seconds_between_submissions) {
        flags.push({
          flag: "TOO_FAST",
          reason: `FRAUD: Submission terlalu cepat (${Math.round(diffSeconds)} detik)`,
          category: "behavior"
        });
      }
    }
  }

  return { flags, is_fraud: flags.length > 0 };
}

// =====================================================
// API ROUTES
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = supabase
      .from("submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (search) {
      query = query.or(`submission_code.ilike.%${search}%,customer_name.ilike.%${search}%`);
    }

    const { data, count } = await query.range((page - 1) * limit, page * limit);

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();

    const campaign_id = formData.get("campaign_id") as string;
    const campaign_name = formData.get("campaign_name") as string;
    const device_info = formData.get("device_info") as string;
    const device_fingerprint_hash = formData.get("device_fingerprint_hash") as string;
    const gps_lat = formData.get("gps_lat") as string;
    const gps_lng = formData.get("gps_lng") as string;
    const sales_id = formData.get("sales_id") as string;
    const sales_name = formData.get("sales_name") as string;
    const pic_id = formData.get("pic_id") as string;
    const pic_name = formData.get("pic_name") as string;
    const customer_name = formData.get("customer_name") as string;
    const customer_phone = formData.get("customer_phone") as string;
    const customer_email = formData.get("customer_email") as string;
    const time_on_page_ms = parseInt(formData.get("time_on_page_ms") as string) || undefined;
    const typing_speeds_raw = formData.get("typing_speeds") as string;
    const typing_speeds = typing_speeds_raw ? JSON.parse(typing_speeds_raw) : undefined;
    const evidence_hashes_raw = formData.get("evidence_hashes") as string;
    const evidence_hashes = evidence_hashes_raw ? JSON.parse(evidence_hashes_raw) : undefined;
    const evidence_types_raw = formData.get("evidence_types") as string;
    const evidence_types = evidence_types_raw ? JSON.parse(evidence_types_raw) : undefined;

    if (!campaign_id || !customer_name || !customer_phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate submission code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let submissionCode = "ACT-";
    for (let i = 0; i < 8; i++) {
      submissionCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Normalize phone
    let phone = customer_phone.replace(/[^\d+]/g, "");
    if (phone.startsWith("0")) phone = "+62" + phone.slice(1);

    // Get IP
    const ip_address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    // Fetch campaign fraud rules
    const { data: campaignData } = await supabase
      .from("campaigns")
      .select("id, name, fraud_rules, required_evidence")
      .eq("id", campaign_id)
      .single();

    // Parse fraud rules
    const fraudRules = {
      require_screenshot_download: true,
      require_screenshot_register: true,
      require_screenshot_rating: true,
      require_gps: false,
      check_duplicate_phone: true,
      check_duplicate_name: true,
      check_duplicate_email: true,
      check_duplicate_ip: false,
      check_duplicate_device: false,
      check_submission_velocity: false,
      min_seconds_between_submissions: 30,
      ...(campaignData?.fraud_rules || {}),
    };

    // Parse required evidence
    let requiredEvidence: { id: string; label: string; required: boolean }[] = [];
    if (campaignData?.required_evidence) {
      requiredEvidence = typeof campaignData.required_evidence === "string"
        ? JSON.parse(campaignData.required_evidence)
        : campaignData.required_evidence;
    }

    // Check uploaded files - use exact ID match
    const downloadEvidence = requiredEvidence.find(e => e.id === 'download' || e.id.includes('download'));
    const registerEvidence = requiredEvidence.find(e => e.id === 'register' || e.id.includes('register'));
    const ratingEvidence = requiredEvidence.find(e => e.id === 'rating' || e.id.includes('rating'));

    const screenshotDownload = downloadEvidence ? formData.get(`evidence_${downloadEvidence.id}`) !== null : false;
    const screenshotRegister = registerEvidence ? formData.get(`evidence_${registerEvidence.id}`) !== null : false;
    const screenshotRating = ratingEvidence ? formData.get(`evidence_${ratingEvidence.id}`) !== null : false;

    // Run fraud detection
    const fraudResult = await detectFraud(supabase, {
      customer_phone: phone,
      customer_name,
      customer_email: customer_email || undefined,
      campaign_id,
      device_info: device_info || undefined,
      device_fingerprint_hash: device_fingerprint_hash || undefined,
      gps_lat,
      gps_lng,
      ip_address: ip_address || undefined,
      screenshot_download: screenshotDownload,
      screenshot_register: screenshotRegister,
      screenshot_rating: screenshotRating,
      evidence_hashes,
      evidence_types,
      time_on_page_ms,
      typing_speeds,
    }, fraudRules);

    const status = fraudResult.is_fraud ? "fraud" : "valid";
    const fraudFlagsJson = JSON.stringify(fraudResult.flags);
    const fraudReasonsJson = JSON.stringify(fraudResult.flags.map(f => f.reason));

    // Insert submission
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        submission_code: submissionCode,
        sales_id: sales_id || "",
        sales_name: sales_name || "",
        pic_id: pic_id || "",
        pic_name: pic_name || "",
        campaign_id,
        campaign_name: campaign_name || "",
        customer_name,
        customer_email: customer_email || null,
        customer_phone: phone,
        customer_phone_masked: phone.slice(0, 4) + "****" + phone.slice(-4),
        device_info: device_info || null,
        device_fingerprint_hash: device_fingerprint_hash || null,
        gps_lat: gps_lat ? parseFloat(gps_lat) : null,
        gps_lng: gps_lng ? parseFloat(gps_lng) : null,
        screenshot_download: screenshotDownload,
        screenshot_register: screenshotRegister,
        screenshot_rating: screenshotRating,
        status,
        fraud_flags: fraudFlagsJson,
        fraud_score: fraudResult.is_fraud ? 100 : 0,
        fraud_decision: fraudResult.is_fraud ? "fraud" : "valid",
        fraud_reasons: fraudReasonsJson,
        qc_notes: fraudResult.is_fraud ? fraudResult.flags.map(f => f.reason).join("; ") : null,
        ip_address: ip_address || null,
        user_agent: request.headers.get("user-agent"),
        behavior_data: JSON.stringify({ time_on_page_ms, typing_speeds }),
      })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Upload evidence files
    for (const evidence of requiredEvidence) {
      const file = formData.get(`evidence_${evidence.id}`) as File | null;
      if (file && file.size > 0) {
        try {
          const ext = file.name.split(".").pop() || 'jpg';
          const fileName = `${submissionCode}/${evidence.id}.${ext}`;
          const buffer = await file.arrayBuffer();

          const { error: uploadError } = await supabase.storage
            .from("screenshots")
            .upload(fileName, buffer, { contentType: file.type, upsert: true });

          // Continue even if upload fails (non-blocking)
          const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/screenshots/${fileName}`;

          await supabase.from("screenshot_evidence").insert({
            submission_id: data.id,
            evidence_type: evidence.id,
            storage_url: storageUrl,
            file_size: file.size,
          });
        } catch (e) {
          console.error("Upload error:", e);
          // Continue processing even if this file fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      data,
      submissionCode,
      status,
      fraudDecision: fraudResult.is_fraud ? "fraud" : "valid",
      fraudFlags: fraudResult.flags,
      message: fraudResult.is_fraud
        ? `FRAUD: ${fraudResult.flags.map(f => f.reason).join("; ")}`
        : "Submission valid",
    }, { status: 201 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
