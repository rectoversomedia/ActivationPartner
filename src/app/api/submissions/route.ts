import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Severity to score mapping
const SEVERITY_SCORES: Record<string, number> = {
  low: 5,
  medium: 15,
  high: 25,
  critical: 40,
  error: 20,
};

// Decision thresholds
const DECISION_THRESHOLDS = {
  allow: 25,
  review: 50,
  flag: 75,
  block: 100,
};

/**
 * Calculate fraud score from flags
 */
function calculateFraudScore(flags: Array<{ flag: string; severity: string; score?: number }>): number {
  let score = 0;
  const seenTypes = new Set<string>();

  for (const flag of flags) {
    const flagKey = flag.flag.substring(0, 20);
    if (seenTypes.has(flagKey)) continue;
    seenTypes.add(flagKey);

    score += flag.score || SEVERITY_SCORES[flag.severity] || 5;
  }

  return Math.min(score, 100);
}

/**
 * Determine fraud decision based on score
 */
function determineDecision(score: number): string {
  if (score >= DECISION_THRESHOLDS.block) return "block";
  if (score >= DECISION_THRESHOLDS.flag) return "flag";
  if (score >= DECISION_THRESHOLDS.review) return "review";
  return "allow";
}

/**
 * Get risk level label
 */
function getRiskLevel(score: number): string {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

// =====================================================
// FRAUD DETECTION ENGINE v2
// =====================================================

interface FraudFlag {
  flag: string;
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  score: number;
  metadata?: Record<string, any>;
}

async function detectFraudV2(
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
): Promise<{ flags: any[]; score: number; decision: string; riskLevel: string }> {
  const flags: FraudFlag[] = [];

  // ============================================
  // 1. EVIDENCE CHECKS (Required Screenshots)
  // ============================================
  if (fraudRules.require_screenshot_download && !submission.screenshot_download) {
    flags.push({
      flag: "EVIDENCE_MISSING",
      reason: "Screenshot Download wajib diupload",
      severity: "high" as const,
      category: "evidence",
      score: 20,
    });
  }
  if (fraudRules.require_screenshot_register && !submission.screenshot_register) {
    flags.push({
      flag: "EVIDENCE_MISSING",
      reason: "Screenshot Registrasi wajib diupload",
      severity: "high" as const,
      category: "evidence",
      score: 20,
    });
  }
  if (fraudRules.require_screenshot_rating && !submission.screenshot_rating) {
    flags.push({
      flag: "EVIDENCE_MISSING",
      reason: "Screenshot Rating wajib diupload",
      severity: "high" as const,
      category: "evidence",
      score: 20,
    });
  }

  // ============================================
  // 1B. DUPLICATE SCREENSHOT CHECK
  // ============================================
  // Check if multiple evidence types have the same image hash
  if (submission.evidence_hashes && submission.evidence_hashes.length > 1) {
    const hashCounts: Record<string, number> = {};
    const hashToType: Record<string, string[]> = {};

    for (const hash of submission.evidence_hashes) {
      if (hash && hash !== 'pending') {
        hashCounts[hash] = (hashCounts[hash] || 0) + 1;
        if (!hashToType[hash]) hashToType[hash] = [];
        if (submission.evidence_types) {
          const idx = submission.evidence_hashes.indexOf(hash);
          if (submission.evidence_types[idx]) {
            hashToType[hash].push(submission.evidence_types[idx]);
          }
        }
      }
    }

    // Flag if same hash used for multiple evidence
    for (const [hash, count] of Object.entries(hashCounts)) {
      if (count > 1) {
        flags.push({
          flag: "DUPLICATE_SCREENSHOT",
          reason: `Foto yang sama digunakan untuk ${count} evidence berbeda (kemungkinan foto diambil dari screenshot yang sama)`,
          severity: "critical" as const,
          category: "evidence",
          score: 40,
          metadata: { hash, evidenceTypes: hashToType[hash] || [] },
        });
      }
    }
  }

  // ============================================
  // 2. GPS CHECKS
  // ============================================
  if (fraudRules.require_gps && (!submission.gps_lat || !submission.gps_lng)) {
    flags.push({
      flag: "NO_GPS_DATA",
      reason: "Data GPS wajib ada",
      severity: "high" as const,
      category: "location",
      score: 15,
    });
  }

  if (submission.gps_lat && submission.gps_lng) {
    const lat = parseFloat(submission.gps_lat);
    const lng = parseFloat(submission.gps_lng);
    if (lat === 0 && lng === 0) {
      flags.push({
        flag: "GPS_INVALID",
        reason: "Koordinat GPS tidak valid (0,0)",
        severity: "high" as const,
        category: "location",
        score: 25,
      });
    }
  }

  // ============================================
  // 3. BOT BEHAVIOR CHECKS
  // ============================================
  if (submission.time_on_page_ms !== undefined) {
    if (submission.time_on_page_ms < 3000) {
      flags.push({
        flag: "BOT_ULTRA_FAST",
        reason: `Waktu di halaman hanya ${submission.time_on_page_ms}ms (kemungkinan bot)`,
        severity: "high" as const,
        category: "behavior",
        score: 25,
        metadata: { timeOnPageMs: submission.time_on_page_ms },
      });
    } else if (submission.time_on_page_ms < 8000) {
      flags.push({
        flag: "BOT_FAST",
        reason: `Waktu di halaman ${submission.time_on_page_ms}ms (terlalu cepat)`,
        severity: "medium" as const,
        category: "behavior",
        score: 15,
      });
    }
  }

  if (submission.typing_speeds && submission.typing_speeds.length > 0) {
    const avgSpeed = submission.typing_speeds.reduce((a, b) => a + b, 0) / submission.typing_speeds.length;
    if (avgSpeed > 20) {
      flags.push({
        flag: "BOT_TYPING",
        reason: `Typing speed ${avgSpeed.toFixed(1)} cps (kemungkinan bot)`,
        severity: "high" as const,
        category: "behavior",
        score: 25,
      });
    } else if (avgSpeed > 12) {
      flags.push({
        flag: "BOT_TYPING_SUSPICIOUS",
        reason: `Typing speed ${avgSpeed.toFixed(1)} cps (lebih cepat dari normal)`,
        severity: "medium" as const,
        category: "behavior",
        score: 15,
      });
    }
  }

  // ============================================
  // 4. DUPLICATE CUSTOMER DATA CHECKS
  // ============================================
  if (fraudRules.check_duplicate_phone && submission.customer_phone) {
    const { data: dupPhone } = await supabase
      .from("submissions")
      .select("id, submission_code, created_at, campaign_id")
      .eq("customer_phone", submission.customer_phone)
      .eq("campaign_id", submission.campaign_id)
      .limit(1);

    if (dupPhone && dupPhone.length > 0) {
      flags.push({
        flag: "DUPLICATE_PHONE",
        reason: `HP '${submission.customer_phone}' sudah terdaftar: ${dupPhone[0].submission_code}`,
        severity: "critical" as const,
        category: "device",
        score: 40,
        metadata: { existingCode: dupPhone[0].submission_code },
      });
    }
  }

  if (fraudRules.check_duplicate_name && submission.customer_name) {
    const { data: dupName } = await supabase
      .from("submissions")
      .select("id, submission_code, customer_phone, created_at")
      .eq("campaign_id", submission.campaign_id)
      .ilike("customer_name", submission.customer_name.toLowerCase().trim())
      .neq("customer_phone", submission.customer_phone)
      .limit(1);

    if (dupName && dupName.length > 0) {
      flags.push({
        flag: "DUPLICATE_NAME",
        reason: `Nama '${submission.customer_name}' sudah terdaftar dengan HP berbeda`,
        severity: "medium" as const,
        category: "device",
        score: 15,
        metadata: { existingCode: dupName[0].submission_code },
      });
    }
  }

  if (fraudRules.check_duplicate_email && submission.customer_email) {
    const { data: dupEmail } = await supabase
      .from("submissions")
      .select("id, submission_code, created_at")
      .eq("customer_email", submission.customer_email)
      .eq("campaign_id", submission.campaign_id)
      .not("customer_email", "is", null)
      .limit(1);

    if (dupEmail && dupEmail.length > 0) {
      flags.push({
        flag: "DUPLICATE_EMAIL",
        reason: `Email '${submission.customer_email}' sudah terdaftar: ${dupEmail[0].submission_code}`,
        severity: "medium" as const,
        category: "device",
        score: 15,
      });
    }
  }

  // ============================================
  // 5. DEVICE FARM CHECK (1 HP, Multiple Accounts)
  // ============================================
  if (submission.device_fingerprint_hash || submission.device_info) {
    const deviceField = submission.device_fingerprint_hash ? "device_fingerprint_hash" : "device_info";
    const deviceValue = submission.device_fingerprint_hash || submission.device_info;

    // Find submissions with same device but different phone
    let query = supabase
      .from("submissions")
      .select("id, submission_code, customer_phone, customer_name, created_at")
      .eq(deviceField, deviceValue)
      .eq("campaign_id", submission.campaign_id)
      .neq("customer_phone", submission.customer_phone)
      .gte("created_at", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()); // Last 72 hours

    const { data: deviceFarm } = await query;

    if (deviceFarm && deviceFarm.length > 0) {
      const uniquePhones = [...new Set(deviceFarm.map((s: any) => s.customer_phone))];

      if (uniquePhones.length >= 2) {
        flags.push({
          flag: "DEVICE_FARM_MULTIPLE_ACCOUNTS",
          reason: `Device digunakan untuk ${uniquePhones.length + 1} nomor HP berbeda dalam 72 jam (device farm)`,
          severity: "critical" as const,
          category: "device",
          score: 40,
          metadata: {
            deviceHash: deviceValue,
            uniquePhones: uniquePhones.length,
            submissions: deviceFarm.map((s: any) => s.submission_code),
          },
        });
      }
    }
  }

  // ============================================
  // 6. IP ADDRESS CHECKS
  // ============================================
  if (fraudRules.check_duplicate_ip && submission.ip_address) {
    const { data: dupIp } = await supabase
      .from("submissions")
      .select("id, submission_code, customer_name, customer_phone")
      .eq("ip_address", submission.ip_address)
      .eq("campaign_id", submission.campaign_id)
      .neq("customer_name", submission.customer_name)
      .limit(5);

    if (dupIp && dupIp.length > 0) {
      const uniquePhones = [...new Set(dupIp.map((s: any) => s.customer_phone))];
      flags.push({
        flag: "DUPLICATE_IP",
        reason: `IP '${submission.ip_address}' digunakan untuk ${uniquePhones.length + 1} customer berbeda`,
        severity: "medium" as const,
        category: "device",
        score: 10,
        metadata: { uniquePhones: uniquePhones.length },
      });
    }

    // IP Rate limit
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
          reason: `${ipCount + 1} submission dari IP ini dalam 1 jam (maks: ${fraudRules.max_submissions_per_ip_per_hour})`,
          severity: "high" as const,
          category: "velocity",
          score: 20,
        });
      }
    }
  }

  // ============================================
  // 7. DEVICE RATE LIMITS
  // ============================================
  if (fraudRules.check_duplicate_device && submission.device_info) {
    const deviceField = submission.device_fingerprint_hash ? "device_fingerprint_hash" : "device_info";
    const deviceValue = submission.device_fingerprint_hash || submission.device_info;

    if (fraudRules.max_submissions_per_device_per_day > 0) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: deviceCount } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq(deviceField, deviceValue)
        .eq("campaign_id", submission.campaign_id)
        .gte("created_at", oneDayAgo);

      if (deviceCount && deviceCount >= fraudRules.max_submissions_per_device_per_day) {
        flags.push({
          flag: "DEVICE_RATE_EXCEEDED",
          reason: `${deviceCount + 1} submission dari device ini dalam 24 jam (maks: ${fraudRules.max_submissions_per_device_per_day})`,
          severity: "high" as const,
          category: "velocity",
          score: 25,
        });
      }
    }
  }

  // ============================================
  // 8. GPS LOCATION CHECKS
  // ============================================
  if (fraudRules.check_duplicate_location && submission.gps_lat && submission.gps_lng) {
    const lat = Math.round(parseFloat(submission.gps_lat) * 10000) / 10000;
    const lng = Math.round(parseFloat(submission.gps_lng) * 10000) / 10000;

    // Check for duplicate location
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
      .neq("customer_name", submission.customer_name)
      .limit(10);

    if (dupLocation && dupLocation.length > 0) {
      const uniqueNames = [...new Set(dupLocation.map((s: any) => s.customer_name))];
      flags.push({
        flag: "DUPLICATE_LOCATION",
        reason: `${uniqueNames.length + 1} customer berbeda dari lokasi GPS yang sama`,
        severity: "medium" as const,
        category: "location",
        score: 10,
        metadata: { uniqueCustomers: uniqueNames.length },
      });
    }

    // Location rate limit
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
          reason: `${locCount + 1} submission di lokasi yang sama dalam 24 jam (maks: ${fraudRules.max_same_location_per_day})`,
          severity: "high" as const,
          category: "velocity",
          score: 20,
        });
      }
    }
  }

  // ============================================
  // 9. SUBMISSION VELOCITY CHECK (Robot Detection)
  // ============================================
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
          severity: "medium" as const,
          category: "behavior",
          score: 10,
        });
      }
    }
  }

  // ============================================
  // CALCULATE FINAL SCORE & DECISION
  // ============================================
  const score = calculateFraudScore(flags);
  const decision = determineDecision(score);
  const riskLevel = getRiskLevel(score);

  return { flags, score, decision, riskLevel };
}

// Upload file to Supabase Storage with metadata
async function uploadEvidence(
  supabase: any,
  file: File,
  submissionId: string,
  submissionCode: string,
  evidenceType: string
): Promise<{ url: string; pHash: string; dHash: string; metadata: any } | null> {
  try {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${submissionCode}/${evidenceType}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("screenshots")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Upload error for ${evidenceType}:`, uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("screenshots")
      .getPublicUrl(fileName);

    // Generate simple hash from file content (for similarity check)
    // In production, use actual pHash calculation on server
    const contentHash = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(contentHash));
    const fileHash = hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, "0")).join("");

    return {
      url: urlData.publicUrl,
      pHash: fileHash,
      dHash: fileHash,
      metadata: {
        fileSize: file.size,
        type: file.type,
        lastModified: file.lastModified,
      },
    };
  } catch (error) {
    console.error(`Upload exception for ${evidenceType}:`, error);
    return null;
  }
}

// Track device fingerprint
async function trackDeviceFingerprint(
  supabase: any,
  fingerprintHash: string,
  deviceInfo: string,
  ipAddress: string,
  customerPhone: string
): Promise<void> {
  try {
    // Check if fingerprint exists
    const { data: existing } = await supabase
      .from("device_fingerprints")
      .select("id, ip_addresses, linked_phones, submission_count")
      .eq("fingerprint_hash", fingerprintHash)
      .single();

    if (existing) {
      // Update existing
      const ipAddresses = existing.ip_addresses || [];
      const linkedPhones = existing.linked_phones || [];

      if (!ipAddresses.includes(ipAddress)) {
        ipAddresses.push(ipAddress);
      }
      if (!linkedPhones.includes(customerPhone)) {
        linkedPhones.push(customerPhone);
      }

      await supabase
        .from("device_fingerprints")
        .update({
          ip_addresses: ipAddresses,
          linked_phones: linkedPhones,
          submission_count: existing.submission_count + 1,
          last_seen: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Insert new
      await supabase.from("device_fingerprints").insert({
        fingerprint_hash: fingerprintHash,
        device_info: deviceInfo,
        ip_addresses: [ipAddress],
        linked_phones: [customerPhone],
        submission_count: 1,
        user_agent: "",
      });
    }
  } catch (error) {
    console.error("Error tracking device fingerprint:", error);
  }
}

// =====================================================
// API ROUTES
// =====================================================

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
    const fraudDecision = searchParams.get("fraud_decision");

    let query = supabase
      .from("submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (fraudDecision && fraudDecision !== "all") {
      query = query.eq("fraud_decision", fraudDecision);
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

    // Get all form fields
    const campaign_id = formData.get("campaign_id") as string;
    const campaign_name = formData.get("campaign_name") as string;
    const device_info = formData.get("device_info") as string;
    const device_fingerprint_hash = formData.get("device_fingerprint_hash") as string;
    const gps_lat = formData.get("gps_lat") as string;
    const gps_lng = formData.get("gps_lng") as string;
    const ip_address = formData.get("ip_address") as string;
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
    if (phone.startsWith("0")) {
      phone = "+62" + phone.slice(1);
    }

    // Fetch campaign fraud rules
    const { data: campaignData } = await supabase
      .from("campaigns")
      .select("id, name, fraud_rules, required_evidence")
      .eq("id", campaign_id)
      .single();

    // Parse fraud rules
    let fraudRules = {
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
    if (campaignData?.fraud_rules) {
      const storedRules = typeof campaignData.fraud_rules === "string"
        ? JSON.parse(campaignData.fraud_rules)
        : campaignData.fraud_rules;
      fraudRules = { ...fraudRules, ...storedRules };
    }

    // Parse required evidence
    let requiredEvidence: { id: string; label: string; required: boolean }[] = [];
    if (campaignData?.required_evidence) {
      requiredEvidence = typeof campaignData.required_evidence === "string"
        ? JSON.parse(campaignData.required_evidence)
        : campaignData.required_evidence;
    }

    // Check if files were actually uploaded - check all evidence IDs dynamically
    const uploadedEvidenceIds = requiredEvidence
      .filter(e => formData.get(`evidence_${e.id}`) !== null)
      .map(e => e.id);

    // Check specific evidence types
    const screenshotDownload = uploadedEvidenceIds.some(id => id.includes('download'));
    const screenshotRegister = uploadedEvidenceIds.some(id => id.includes('register'));
    const screenshotRating = uploadedEvidenceIds.some(id => id.includes('rating'));

    // Prepare submission data for fraud check
    const submissionData = {
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
      time_on_page_ms,
      typing_speeds,
    };

    // Run fraud detection v2
    const fraudResult = await detectFraudV2(supabase, submissionData, fraudRules);

    // Determine status based on decision
    let status = "pending";
    if (fraudResult.decision === "block") {
      status = "fraud";
    } else if (fraudResult.decision === "flag" || fraudResult.decision === "review") {
      status = "pending";
    }

    // Get client IP
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || ip_address;

    // Serialize fraud data
    const fraudFlagsJson = JSON.stringify(fraudResult.flags.map((f) => ({
      flag: f.flag,
      reason: f.reason,
      severity: f.severity,
      category: f.category,
      score: f.score,
    })));
    const fraudReasonsJson = JSON.stringify(fraudResult.flags.map((f) => f.reason));

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
        fraud_score: fraudResult.score,
        fraud_decision: fraudResult.decision,
        fraud_reasons: fraudReasonsJson,
        qc_notes: fraudResult.flags.length > 0 ? fraudResult.flags.map((f) => f.reason).join("; ") : null,
        ip_address: clientIp,
        user_agent: request.headers.get("user-agent"),
        behavior_data: JSON.stringify({ time_on_page_ms, typing_speeds }),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Track device fingerprint
    if (device_fingerprint_hash) {
      await trackDeviceFingerprint(supabase, device_fingerprint_hash, device_info || "", clientIp || "", phone);
    }

    // Upload evidence files and store screenshot metadata
    const uploadedEvidence: any[] = [];
    for (const evidence of requiredEvidence) {
      const file = formData.get(`evidence_${evidence.id}`) as File | null;
      if (file) {
        const result = await uploadEvidence(supabase, file, data.id, submissionCode, evidence.id);
        if (result) {
          uploadedEvidence.push({
            evidence_type: evidence.id,
            url: result.url,
            pHash: result.pHash,
            metadata: result.metadata,
          });

          // Store screenshot evidence
          await supabase.from("screenshot_evidence").insert({
            submission_id: data.id,
            evidence_type: evidence.id,
            storage_url: result.url,
            image_hash: result.pHash,
            dhash: result.dHash,
            file_size: result.metadata.fileSize,
            aspect_ratio: 0, // Would need to calculate from image
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data,
      submissionCode,
      status,
      fraudScore: fraudResult.score,
      fraudDecision: fraudResult.decision,
      fraudRiskLevel: fraudResult.riskLevel,
      fraudFlags: fraudResult.flags,
      uploadedEvidence,
      message: fraudResult.decision === "allow"
        ? "Submission created successfully"
        : `Submission ${fraudResult.decision}: ${fraudResult.flags.length} fraud indicator(s)`,
    }, { status: 201 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
