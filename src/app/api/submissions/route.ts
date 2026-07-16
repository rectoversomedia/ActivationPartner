import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Fraud Detection Types
interface FraudCheck {
  flag: string;
  reason: string;
  severity: "warning" | "error" | "critical";
}

// Fraud detection function with campaign-specific rules
async function detectFraud(supabase: any, submission: any, fraudRules: any): Promise<FraudCheck[]> {
  const flags: FraudCheck[] = [];

  // EVIDENCE CHECKS
  if (fraudRules.require_screenshot_download && !submission.screenshot_download) {
    flags.push({ flag: "SCREENSHOT_MISSING", reason: "Screenshot Download wajib diupload", severity: "error" });
  }
  if (fraudRules.require_screenshot_register && !submission.screenshot_register) {
    flags.push({ flag: "SCREENSHOT_MISSING", reason: "Screenshot Registrasi wajib diupload", severity: "error" });
  }
  if (fraudRules.require_screenshot_rating && !submission.screenshot_rating) {
    flags.push({ flag: "SCREENSHOT_MISSING", reason: "Screenshot Rating wajib diupload", severity: "error" });
  }

  // GPS CHECKS
  if (fraudRules.require_gps && (!submission.gps_lat || !submission.gps_lng)) {
    flags.push({ flag: "NO_GPS_DATA", reason: "Data GPS wajib ada", severity: "error" });
  }

  if (submission.gps_lat && submission.gps_lng) {
    const lat = parseFloat(submission.gps_lat);
    const lng = parseFloat(submission.gps_lng);
    if (lat === 0 && lng === 0) {
      flags.push({ flag: "GPS_SUSPICIOUS", reason: "Koordinat GPS tidak valid (0,0)", severity: "error" });
    }
  }

  // CUSTOMER DATA DUPLICATE CHECKS
  if (fraudRules.check_duplicate_phone && submission.customer_phone) {
    const { data: dupPhone } = await supabase
      .from("submissions")
      .select("id, submission_code, created_at")
      .eq("customer_phone", submission.customer_phone)
      .eq("campaign_id", submission.campaign_id);

    if (dupPhone && dupPhone.length > 0) {
      flags.push({
        flag: "DUPLICATE_PHONE",
        reason: `HP '${submission.customer_phone}' sudah terdaftar: ${dupPhone[0].submission_code}`,
        severity: "critical",
      });
    }
  }

  if (fraudRules.check_duplicate_name && submission.customer_name) {
    const { data: dupName } = await supabase
      .from("submissions")
      .select("id, submission_code, created_at")
      .eq("campaign_id", submission.campaign_id)
      .ilike("customer_name", submission.customer_name.toLowerCase().trim());

    if (dupName && dupName.length > 0) {
      flags.push({
        flag: "DUPLICATE_NAME",
        reason: `Nama '${submission.customer_name}' sudah terdaftar: ${dupName[0].submission_code}`,
        severity: "critical",
      });
    }
  }

  if (fraudRules.check_duplicate_email && submission.customer_email) {
    const { data: dupEmail } = await supabase
      .from("submissions")
      .select("id, submission_code, created_at")
      .eq("customer_email", submission.customer_email)
      .eq("campaign_id", submission.campaign_id)
      .not("customer_email", "is", null);

    if (dupEmail && dupEmail.length > 0) {
      flags.push({
        flag: "DUPLICATE_EMAIL",
        reason: `Email '${submission.customer_email}' sudah terdaftar: ${dupEmail[0].submission_code}`,
        severity: "critical",
      });
    }
  }

  // IP ADDRESS CHECKS
  if (fraudRules.check_duplicate_ip && submission.ip_address) {
    const { data: dupIp } = await supabase
      .from("submissions")
      .select("id, submission_code, customer_name")
      .eq("ip_address", submission.ip_address)
      .eq("campaign_id", submission.campaign_id)
      .neq("customer_name", submission.customer_name);

    if (dupIp && dupIp.length > 0) {
      flags.push({
        flag: "DUPLICATE_IP",
        reason: `IP '${submission.ip_address}' sudah digunakan untuk ${dupIp.length + 1} submission (nama berbeda)`,
        severity: "warning",
      });
    }

    if (fraudRules.max_submissions_per_ip_per_hour > 0) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: ipCount } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("ip_address", submission.ip_address)
        .eq("campaign_id", submission.campaign_id)
        .gte("created_at", oneHourAgo);

      if (ipCount && ipCount >= fraudRules.max_submissions_per_ip_per_hour) {
        flags.push({
          flag: "IP_RATE_EXCEEDED",
          reason: `${ipCount} submission dari IP ini dalam 1 jam terakhir (maks: ${fraudRules.max_submissions_per_ip_per_hour})`,
          severity: "error",
        });
      }
    }
  }

  // DEVICE CHECKS
  if (fraudRules.check_duplicate_device && submission.device_info) {
    const { data: dupDevice } = await supabase
      .from("submissions")
      .select("id, submission_code, customer_name")
      .eq("device_info", submission.device_info)
      .eq("campaign_id", submission.campaign_id)
      .neq("customer_name", submission.customer_name);

    if (dupDevice && dupDevice.length > 0) {
      flags.push({
        flag: "DUPLICATE_DEVICE",
        reason: `Device '${submission.device_info}' digunakan untuk ${dupDevice.length + 1} customer berbeda`,
        severity: "warning",
      });
    }

    if (fraudRules.max_submissions_per_device_per_day > 0) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: deviceCount } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("device_info", submission.device_info)
        .eq("campaign_id", submission.campaign_id)
        .gte("created_at", oneDayAgo);

      if (deviceCount && deviceCount >= fraudRules.max_submissions_per_device_per_day) {
        flags.push({
          flag: "DEVICE_RATE_EXCEEDED",
          reason: `${deviceCount} submission dari device ini dalam 24 jam (maks: ${fraudRules.max_submissions_per_device_per_day})`,
          severity: "error",
        });
      }
    }
  }

  // LOCATION CHECKS
  if (fraudRules.check_duplicate_location && submission.gps_lat && submission.gps_lng) {
    const lat = Math.round(parseFloat(submission.gps_lat) * 10000) / 10000;
    const lng = Math.round(parseFloat(submission.gps_lng) * 10000) / 10000;

    const { data: dupLocation } = await supabase
      .from("submissions")
      .select("id, submission_code, customer_name")
      .eq("campaign_id", submission.campaign_id)
      .not("gps_lat", "is", null)
      .not("gps_lng", "is", null)
      .gte("gps_lat", lat - 0.001)
      .lte("gps_lat", lat + 0.001)
      .gte("gps_lng", lng - 0.001)
      .lte("gps_lng", lng + 0.001)
      .neq("customer_name", submission.customer_name);

    if (dupLocation && dupLocation.length > 0) {
      flags.push({
        flag: "DUPLICATE_LOCATION",
        reason: `${dupLocation.length + 1} submission dari lokasi GPS yang sama`,
        severity: "warning",
      });
    }

    if (fraudRules.max_same_location_per_day > 0) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: locCount } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", submission.campaign_id)
        .gte("gps_lat", lat - 0.001)
        .lte("gps_lat", lat + 0.001)
        .gte("gps_lng", lng - 0.001)
        .lte("gps_lng", lng + 0.001)
        .gte("created_at", oneDayAgo);

      if (locCount && locCount >= fraudRules.max_same_location_per_day) {
        flags.push({
          flag: "LOCATION_RATE_EXCEEDED",
          reason: `${locCount} submission di lokasi ini dalam 24 jam (maks: ${fraudRules.max_same_location_per_day})`,
          severity: "error",
        });
      }
    }
  }

  // VELOCITY CHECK (Robot Detection)
  if (fraudRules.check_submission_velocity && fraudRules.min_seconds_between_submissions > 0) {
    const { data: lastSubmission } = await supabase
      .from("submissions")
      .select("created_at")
      .eq("campaign_id", submission.campaign_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastSubmission) {
      const lastTime = new Date(lastSubmission.created_at).getTime();
      const now = Date.now();
      const diffSeconds = (now - lastTime) / 1000;

      if (diffSeconds < fraudRules.min_seconds_between_submissions) {
        flags.push({
          flag: "SUBMISSION_VELOCITY",
          reason: `Submission terlalu cepat: ${Math.round(diffSeconds)} detik sejak submission terakhir (min: ${fraudRules.min_seconds_between_submissions} detik)`,
          severity: "warning",
        });
      }
    }
  }

  return flags;
}

// Upload file to Supabase Storage
async function uploadFile(supabase: any, file: File, submissionCode: string, type: string): Promise<string | null> {
  try {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${submissionCode}/${type}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error } = await supabase.storage
      .from("screenshots")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error(`Upload error for ${type}:`, error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("screenshots")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error(`Upload exception for ${type}:`, error);
    return null;
  }
}

// GET - Fetch submissions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sales = searchParams.get("sales");

    let query = supabase
      .from("submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (sales && sales !== "all") {
      query = query.eq("sales_name", sales);
    }

    if (search) {
      query = query.or(`submission_code.ilike.%${search}%,customer_name.ilike.%${search}%,sales_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range((page - 1) * limit, page * limit);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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

// POST - Create new submission
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();

    const sales_id = formData.get("sales_id") as string;
    const pic_id = formData.get("pic_id") as string;
    const campaign_id = formData.get("campaign_id") as string;
    const customer_name = formData.get("customer_name") as string;
    const customer_phone = formData.get("customer_phone") as string;
    const customer_email = formData.get("customer_email") as string;
    const sales_name = formData.get("sales_name") as string;
    const pic_name = formData.get("pic_name") as string;
    const campaign_name = formData.get("campaign_name") as string;
    const device_info = formData.get("device_info") as string;
    const gps_lat = formData.get("gps_lat") as string;
    const gps_lng = formData.get("gps_lng") as string;
    const ip_address = formData.get("ip_address") as string;

    if (!sales_id || !pic_id || !campaign_id || !customer_name || !customer_phone) {
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
    if (phone.startsWith("0")) {
      phone = "+62" + phone.slice(1);
    }

    // Fetch campaign fraud rules
    const { data: campaignData } = await supabase
      .from("campaigns")
      .select("id, name, fraud_rules")
      .eq("id", campaign_id)
      .single();

    // Default advanced rules
    const fraudRules = campaignData?.fraud_rules || {
      require_screenshot_download: true,
      require_screenshot_register: true,
      require_screenshot_rating: true,
      require_gps: true,
      check_duplicate_phone: true,
      check_duplicate_name: true,
      check_duplicate_email: true,
      check_duplicate_ip: true,
      max_submissions_per_ip_per_hour: 5,
      check_duplicate_device: true,
      max_submissions_per_device_per_day: 20,
      check_duplicate_location: true,
      max_same_location_per_day: 10,
      check_submission_velocity: true,
      min_seconds_between_submissions: 30,
    };

    // Prepare submission data for fraud check
    const submissionData = {
      customer_phone: phone,
      customer_name,
      customer_email: customer_email || null,
      campaign_id,
      device_info: device_info || null,
      gps_lat: gps_lat || null,
      gps_lng: gps_lng || null,
      ip_address: ip_address || null,
      screenshot_download: true,
      screenshot_register: true,
      screenshot_rating: true,
    };

    // Run fraud detection
    const fraudFlags = await detectFraud(supabase, submissionData, fraudRules);

    // Determine status
    let status = "pending";
    if (fraudFlags.some(f => f.severity === "critical")) {
      status = "fraud";
    } else if (fraudFlags.some(f => f.severity === "error")) {
      status = "invalid";
    }

    // Serialize fraud flags
    const fraudFlagsJson = JSON.stringify(fraudFlags.map(f => ({
      flag: f.flag,
      reason: f.reason,
      severity: f.severity,
    })));

    // Get client IP
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || ip_address;

    // Insert submission
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        submission_code: submissionCode,
        sales_id,
        sales_name,
        pic_id,
        pic_name,
        campaign_id,
        campaign_name,
        customer_name,
        customer_email: customer_email || null,
        customer_phone: phone,
        customer_phone_masked: phone.slice(0, 4) + "****" + phone.slice(-4),
        device_info: device_info || null,
        gps_lat: gps_lat ? parseFloat(gps_lat) : null,
        gps_lng: gps_lng ? parseFloat(gps_lng) : null,
        screenshot_download: true,
        screenshot_register: true,
        screenshot_rating: true,
        status,
        fraud_flags: fraudFlagsJson,
        qc_notes: fraudFlags.length > 0 ? fraudFlags.map(f => f.reason).join("; ") : null,
        ip_address: clientIp,
        user_agent: request.headers.get("user-agent"),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Upload files
    const uploadedUrls: Record<string, string> = {};

    const screenshotDownload = formData.get("screenshot_download") as File | null;
    const screenshotRegister = formData.get("screenshot_register") as File | null;
    const screenshotRating = formData.get("screenshot_rating") as File | null;

    if (screenshotDownload) {
      const url = await uploadFile(supabase, screenshotDownload, submissionCode, "download");
      if (url) uploadedUrls.screenshot_download_url = url;
    }
    if (screenshotRegister) {
      const url = await uploadFile(supabase, screenshotRegister, submissionCode, "register");
      if (url) uploadedUrls.screenshot_register_url = url;
    }
    if (screenshotRating) {
      const url = await uploadFile(supabase, screenshotRating, submissionCode, "rating");
      if (url) uploadedUrls.screenshot_rating_url = url;
    }

    // Update submission with URLs
    if (Object.keys(uploadedUrls).length > 0) {
      await supabase.from("submissions").update(uploadedUrls).eq("id", data.id);
    }

    return NextResponse.json({
      data: { ...data, ...uploadedUrls },
      submissionCode,
      status,
      fraudFlags,
      message: status === "pending"
        ? "Submission created successfully"
        : `Submission flagged as ${status}`,
    }, { status: 201 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
