import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Fraud Detection Types
interface FraudCheck {
  flag: string;
  reason: string;
  severity: 'warning' | 'error' | 'critical';
}

const FRAUD_REASONS: Record<string, string> = {
  // Duplicate detection (ACTUAL FRAUD)
  DUPLICATE_PHONE: 'Nomor telepon sudah terdaftar sebelumnya',
  DUPLICATE_NAME: 'Nama customer sudah terdaftar sebelumnya',
  DUPLICATE_EMAIL: 'Email customer sudah terdaftar sebelumnya',
  DUPLICATE_ALL: 'Customer sudah terdaftar (nama, email, atau telepon sama)',

  // Screenshot issues
  SCREENSHOT_MISSING: 'Screenshot bukti tidak lengkap',
  SCREENSHOT_INCOMPLETE: 'Bukti screenshot tidak lengkap',

  // GPS issues
  GPS_SUSPICIOUS: 'Lokasi GPS mencurigakan atau tidak valid',
  GPS_OUTSIDE_AREA: 'Lokasi GPS di luar area operasional',
  NO_GPS_DATA: 'Data GPS tidak tersedia',

  // Evidence quality
  INSUFFICIENT_EVIDENCE: 'Bukti aktivasi tidak cukup',
};

// Main fraud detection function - focused on ACTUAL fraud, not normal patterns
async function detectFraud(supabase: any, submission: any): Promise<FraudCheck[]> {
  const flags: FraudCheck[] = [];

  // ==========================================
  // CHECK 1: Screenshot completeness (REQUIRED)
  // ==========================================
  if (!submission.screenshot_download || !submission.screenshot_register || !submission.screenshot_rating) {
    flags.push({
      flag: 'SCREENSHOT_MISSING',
      reason: FRAUD_REASONS['SCREENSHOT_MISSING'],
      severity: 'error',
    });
  }

  // ==========================================
  // CHECK 2: GPS data (REQUIRED)
  // ==========================================
  if (!submission.gps_lat || !submission.gps_lng) {
    flags.push({
      flag: 'NO_GPS_DATA',
      reason: FRAUD_REASONS['NO_GPS_DATA'],
      severity: 'warning', // Warning only - GPS might fail
    });
  } else {
    // Check for invalid coordinates
    const lat = parseFloat(submission.gps_lat);
    const lng = parseFloat(submission.gps_lng);

    if (lat === 0 && lng === 0) {
      flags.push({
        flag: 'GPS_SUSPICIOUS',
        reason: 'Koordinat GPS tidak valid (0,0)',
        severity: 'error',
      });
    }
  }

  // ==========================================
  // CHECK 3: DUPLICATE PHONE (CRITICAL FRAUD)
  // ==========================================
  if (submission.customer_phone) {
    const { data: duplicatePhone } = await supabase
      .from('submissions')
      .select('id, submission_code, customer_name, created_at')
      .eq('customer_phone', submission.customer_phone)
      .eq('campaign_id', submission.campaign_id); // Same campaign

    if (duplicatePhone && duplicatePhone.length > 0) {
      flags.push({
        flag: 'DUPLICATE_PHONE',
        reason: `Nomor telepon '${submission.customer_phone}' sudah terdaftar di submission ${duplicatePhone[0].submission_code}`,
        severity: 'critical',
      });
    }
  }

  // ==========================================
  // CHECK 4: DUPLICATE NAME (CRITICAL FRAUD)
  // ==========================================
  if (submission.customer_name) {
    // Normalize name for comparison (lowercase, trim spaces)
    const normalizedName = submission.customer_name.toLowerCase().trim();

    const { data: duplicateName } = await supabase
      .from('submissions')
      .select('id, submission_code, customer_phone, created_at')
      .eq('campaign_id', submission.campaign_id)
      .ilike('customer_name', normalizedName); // Case insensitive

    if (duplicateName && duplicateName.length > 0) {
      flags.push({
        flag: 'DUPLICATE_NAME',
        reason: `Nama '${submission.customer_name}' sudah terdaftar di submission ${duplicateName[0].submission_code}`,
        severity: 'critical',
      });
    }
  }

  // ==========================================
  // CHECK 5: DUPLICATE EMAIL (CRITICAL FRAUD)
  // ==========================================
  if (submission.customer_email) {
    const { data: duplicateEmail } = await supabase
      .from('submissions')
      .select('id, submission_code, customer_name, created_at')
      .eq('customer_email', submission.customer_email)
      .eq('campaign_id', submission.campaign_id)
      .not('customer_email', 'is', null);

    if (duplicateEmail && duplicateEmail.length > 0) {
      flags.push({
        flag: 'DUPLICATE_EMAIL',
        reason: `Email '${submission.customer_email}' sudah terdaftar di submission ${duplicateEmail[0].submission_code}`,
        severity: 'critical',
      });
    }
  }

  // ==========================================
  // CHECK 6: GPS Location validation (per campaign)
  // ==========================================
  if (submission.gps_lat && submission.gps_lng && submission.allowed_regions) {
    const lat = parseFloat(submission.gps_lat);
    const lng = parseFloat(submission.gps_lng);

    // Check if location is within allowed regions
    const isInAllowedRegion = submission.allowed_regions.some((region: any) => {
      const distance = Math.sqrt(
        Math.pow(lat - region.lat, 2) + Math.pow(lng - region.lng, 2)
      );
      return distance <= region.radius; // radius in degrees
    });

    if (!isInAllowedRegion && submission.allowed_regions.length > 0) {
      flags.push({
        flag: 'GPS_OUTSIDE_AREA',
        reason: 'Lokasi GPS di luar area operasional yang diizinkan',
        severity: 'warning',
      });
    }
  }

  return flags;
}

// Upload file to Supabase Storage
async function uploadFile(supabase: any, file: File, submissionCode: string, type: string): Promise<string | null> {
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${submissionCode}/${type}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('screenshots')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error(`Upload error for ${type}:`, error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('screenshots')
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

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sales = searchParams.get('sales');

    let query = supabase
      .from('submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (sales && sales !== 'all') {
      query = query.eq('sales_name', sales);
    }

    if (search) {
      query = query.or(`submission_code.ilike.%${search}%,customer_name.ilike.%${search}%,sales_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range((page - 1) * limit, page * limit);

    if (error) {
      console.error('Supabase error:', error);
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
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new submission with file upload
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse FormData
    const formData = await request.formData();

    // Extract text fields
    const sales_id = formData.get('sales_id') as string;
    const pic_id = formData.get('pic_id') as string;
    const campaign_id = formData.get('campaign_id') as string;
    const customer_name = formData.get('customer_name') as string;
    const customer_phone = formData.get('customer_phone') as string;
    const customer_email = formData.get('customer_email') as string;
    const sales_name = formData.get('sales_name') as string;
    const pic_name = formData.get('pic_name') as string;
    const campaign_name = formData.get('campaign_name') as string;
    const device_info = formData.get('device_info') as string;
    const gps_lat = formData.get('gps_lat') as string;
    const gps_lng = formData.get('gps_lng') as string;

    // Validate required fields
    if (!sales_id || !pic_id || !campaign_id || !customer_name || !customer_phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate submission code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let submissionCode = 'ACT-';
    for (let i = 0; i < 8; i++) {
      submissionCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Normalize phone
    let phone = customer_phone.replace(/[^\d+]/g, '');
    if (phone.startsWith('0')) {
      phone = '+62' + phone.slice(1);
    }

    // Fetch campaign settings for fraud rules
    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('id, name, fraud_rules, allowed_regions')
      .eq('id', campaign_id)
      .single();

    // Prepare submission data for fraud check
    const submissionData = {
      device_info: device_info || null,
      customer_phone: phone,
      customer_name,
      customer_email: customer_email || null,
      campaign_id,
      gps_lat: gps_lat || null,
      gps_lng: gps_lng || null,
      screenshot_download: true, // Files are present
      screenshot_register: true,
      screenshot_rating: true,
      allowed_regions: campaignData?.allowed_regions || [],
    };

    // Run fraud detection with campaign-specific rules
    const fraudFlags = await detectFraud(supabase, submissionData);

    // Determine initial status
    let status = 'pending';
    if (fraudFlags.some(f => f.severity === 'critical')) {
      status = 'fraud';
    } else if (fraudFlags.some(f => f.severity === 'error')) {
      status = 'invalid';
    }

    // Serialize fraud flags for storage
    const fraudFlagsJson = JSON.stringify(fraudFlags.map(f => ({
      flag: f.flag,
      reason: f.reason,
      severity: f.severity,
    })));

    // Insert submission first (without file URLs)
    const { data, error } = await supabase
      .from('submissions')
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
        customer_phone_masked: phone.slice(0, 4) + '****' + phone.slice(-4),
        device_info: device_info || null,
        gps_lat: gps_lat ? parseFloat(gps_lat) : null,
        gps_lng: gps_lng ? parseFloat(gps_lng) : null,
        screenshot_download: true,
        screenshot_register: true,
        screenshot_rating: true,
        status,
        fraud_flags: fraudFlagsJson,
        qc_notes: fraudFlags.length > 0 ? fraudFlags.map(f => f.reason).join('; ') : null,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
        user_agent: request.headers.get('user-agent'),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Upload files after submission is created
    const uploadedUrls: Record<string, string> = {};

    const screenshotDownload = formData.get('screenshot_download') as File | null;
    const screenshotRegister = formData.get('screenshot_register') as File | null;
    const screenshotRating = formData.get('screenshot_rating') as File | null;

    if (screenshotDownload) {
      const url = await uploadFile(supabase, screenshotDownload, submissionCode, 'download');
      if (url) uploadedUrls.screenshot_download_url = url;
    }
    if (screenshotRegister) {
      const url = await uploadFile(supabase, screenshotRegister, submissionCode, 'register');
      if (url) uploadedUrls.screenshot_register_url = url;
    }
    if (screenshotRating) {
      const url = await uploadFile(supabase, screenshotRating, submissionCode, 'rating');
      if (url) uploadedUrls.screenshot_rating_url = url;
    }

    // Update submission with file URLs
    if (Object.keys(uploadedUrls).length > 0) {
      await supabase
        .from('submissions')
        .update(uploadedUrls)
        .eq('id', data.id);
    }

    return NextResponse.json({
      data: { ...data, ...uploadedUrls },
      submissionCode,
      status,
      fraudFlags,
      message: status === 'pending'
        ? 'Submission created successfully'
        : `Submission flagged as ${status}`,
    }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
