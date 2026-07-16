/**
 * Fraud Detection Engine
 * Real-time scoring and decision making
 */

import { hammingDistance, calculateSimilarity } from './screenshot-analyzer';

export type FraudSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FraudDecision = 'allow' | 'review' | 'flag' | 'block';

export interface FraudFlag {
  flag: string;
  reason: string;
  severity: FraudSeverity;
  category: 'device' | 'evidence' | 'behavior' | 'velocity' | 'location';
  score: number;
  metadata?: Record<string, any>;
}

export interface FraudCheckResult {
  score: number;
  decision: FraudDecision;
  flags: FraudFlag[];
  summary: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface FraudCheckContext {
  // Submission data
  customerPhone: string;
  customerName: string;
  customerEmail?: string;
  deviceFingerprintHash: string;
  deviceInfo: string;
  ipAddress: string;
  gpsLat?: number;
  gpsLng?: number;

  // Evidence data
  screenshotHashes: string[];
  screenshotCount: number;

  // Behavior data
  timeOnPageMs?: number;
  typingSpeeds?: number[];
  mouseMovements?: number;
  mouseClicks?: number;

  // Campaign rules
  maxSubmissionsPerIpPerHour?: number;
  maxSubmissionsPerDevicePerDay?: number;
  checkDuplicatePhone?: boolean;
  checkDuplicateName?: boolean;
  checkDuplicateEmail?: boolean;
}

// Severity to score mapping
const SEVERITY_SCORES: Record<FraudSeverity, number> = {
  low: 5,
  medium: 15,
  high: 25,
  critical: 40,
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
export function calculateFraudScore(flags: FraudFlag[]): number {
  let score = 0;

  // Count unique flag types
  const flagTypes = new Set<string>();

  for (const flag of flags) {
    // Deduplicate similar flags
    const flagKey = flag.flag.substring(0, 20); // First 20 chars as key
    if (flagTypes.has(flagKey)) continue;
    flagTypes.add(flagKey);

    score += flag.score;
  }

  return Math.min(score, 100);
}

/**
 * Determine decision based on score
 */
export function determineDecision(score: number): FraudDecision {
  if (score >= DECISION_THRESHOLDS.block) return 'block';
  if (score >= DECISION_THRESHOLDS.flag) return 'flag';
  if (score >= DECISION_THRESHOLDS.review) return 'review';
  return 'allow';
}

/**
 * Get risk level label
 */
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

/**
 * Generate human-readable summary
 */
export function generateSummary(flags: FraudFlag[], decision: FraudDecision): string {
  if (flags.length === 0) {
    return 'No fraud indicators detected';
  }

  const criticalFlags = flags.filter(f => f.severity === 'critical');
  const highFlags = flags.filter(f => f.severity === 'high');
  const mediumFlags = flags.filter(f => f.severity === 'medium');
  const lowFlags = flags.filter(f => f.severity === 'low');

  const parts: string[] = [];

  if (criticalFlags.length > 0) {
    parts.push(`${criticalFlags.length} critical issue(s)`);
  }
  if (highFlags.length > 0) {
    parts.push(`${highFlags.length} high-risk indicator(s)`);
  }
  if (mediumFlags.length > 0) {
    parts.push(`${mediumFlags.length} medium-risk signal(s)`);
  }
  if (lowFlags.length > 0) {
    parts.push(`${lowFlags.length} low-risk flag(s)`);
  }

  let summary = parts.join(', ');

  if (decision === 'block') {
    summary = 'BLOCKED: ' + summary;
  } else if (decision === 'flag') {
    summary = 'FLAGGED: ' + summary;
  } else if (decision === 'review') {
    summary = 'REVIEW NEEDED: ' + summary;
  }

  return summary;
}

// =====================================================
// FRAUD CHECK FUNCTIONS
// =====================================================

/**
 * Check for device farm (same device, multiple accounts)
 */
export async function checkDeviceFarm(
  deviceFingerprintHash: string,
  customerPhone: string,
  recentSubmissions: Array<{ device_fingerprint_hash: string; customer_phone: string; submission_code: string }>
): Promise<FraudFlag[]> {
  const flags: FraudFlag[] = [];

  // Find submissions with same device but different phone
  const sameDevice = recentSubmissions.filter(
    s => s.device_fingerprint_hash === deviceFingerprintHash &&
         s.customer_phone !== customerPhone
  );

  if (sameDevice.length >= 1) {
    flags.push({
      flag: 'DEVICE_FARM_MULTIPLE_PHONES',
      reason: `Device digunakan untuk ${sameDevice.length + 1} nomor HP berbeda (kemungkinan device farm)`,
      severity: 'high',
      category: 'device',
      score: SEVERITY_SCORES.high,
      metadata: {
        deviceHash: deviceFingerprintHash,
        phones: [customerPhone, ...sameDevice.map(s => s.customer_phone)],
        submissions: sameDevice.map(s => s.submission_code),
      },
    });
  }

  return flags;
}

/**
 * Check for screenshot fabrication (similar screenshots)
 */
export async function checkScreenshotFabrication(
  screenshotHashes: string[],
  recentScreenshots: Array<{ image_hash: string; submission_id: string }>
): Promise<FraudFlag[]> {
  const flags: FraudFlag[] = [];

  if (screenshotHashes.length === 0 || recentScreenshots.length === 0) {
    return flags;
  }

  for (const hash of screenshotHashes) {
    for (const recent of recentScreenshots) {
      const similarity = calculateSimilarity(hash, recent.image_hash);

      if (similarity > 90) {
        flags.push({
          flag: 'SCREENSHOT_EXACT_MATCH',
          reason: `Screenshot mirip 100% dengan submission lain (kemungkinan copy-paste)`,
          severity: 'critical',
          category: 'evidence',
          score: SEVERITY_SCORES.critical,
          metadata: {
            thisHash: hash,
            matchedHash: recent.image_hash,
            similarity: `${similarity}%`,
            submissionId: recent.submission_id,
          },
        });
      } else if (similarity > 85) {
        flags.push({
          flag: 'SCREENSHOT_HIGH_SIMILARITY',
          reason: `Screenshot mirip ${similarity}% dengan submission lain (kemungkinan slight edit)`,
          severity: 'high',
          category: 'evidence',
          score: SEVERITY_SCORES.high,
          metadata: {
            similarity: `${similarity}%`,
            submissionId: recent.submission_id,
          },
        });
      } else if (similarity > 70) {
        flags.push({
          flag: 'SCREENSHOT_MODERATE_SIMILARITY',
          reason: `Screenshot memiliki kemiripan ${similarity}% (perlu review manual)`,
          severity: 'medium',
          category: 'evidence',
          score: SEVERITY_SCORES.medium,
          metadata: {
            similarity: `${similarity}%`,
          },
        });
      }
    }
  }

  return flags;
}

/**
 * Check for bot-like behavior
 */
export function checkBotBehavior(
  timeOnPageMs?: number,
  typingSpeeds?: number[]
): FraudFlag[] {
  const flags: FraudFlag[] = [];

  // Check time on page
  if (timeOnPageMs !== undefined) {
    if (timeOnPageMs < 3000) {
      flags.push({
        flag: 'BOT_ULTRA_FAST',
        reason: `Waktu di halaman hanya ${timeOnPageMs}ms (kemungkinan bot)`,
        severity: 'high',
        category: 'behavior',
        score: SEVERITY_SCORES.high,
        metadata: { timeOnPageMs },
      });
    } else if (timeOnPageMs < 8000) {
      flags.push({
        flag: 'BOT_FAST',
        reason: `Waktu di halaman ${timeOnPageMs}ms (terlalu cepat untuk manusia)`,
        severity: 'medium',
        category: 'behavior',
        score: SEVERITY_SCORES.medium,
        metadata: { timeOnPageMs },
      });
    }
  }

  // Check typing speed
  if (typingSpeeds && typingSpeeds.length > 0) {
    const avgSpeed = typingSpeeds.reduce((a, b) => a + b, 0) / typingSpeeds.length;
    const maxSpeed = Math.max(...typingSpeeds);

    if (avgSpeed > 20) { // chars per second
      flags.push({
        flag: 'BOT_TYPING_SUPER_FAST',
        reason: `Typing speed rata-rata ${avgSpeed.toFixed(1)} cps (kemungkinan bot)`,
        severity: 'high',
        category: 'behavior',
        score: SEVERITY_SCORES.high,
        metadata: { avgSpeed, maxSpeed },
      });
    } else if (avgSpeed > 12) {
      flags.push({
        flag: 'BOT_TYPING_FAST',
        reason: `Typing speed ${avgSpeed.toFixed(1)} cps (lebih cepat dari normal)`,
        severity: 'medium',
        category: 'behavior',
        score: SEVERITY_SCORES.medium,
        metadata: { avgSpeed },
      });
    }

    // Check typing consistency (bots are too consistent)
    if (typingSpeeds.length >= 3) {
      const stdDev = calculateStdDev(typingSpeeds);
      if (stdDev < 0.5) {
        flags.push({
          flag: 'BOT_TYPING_UNIFORM',
          reason: `Typing pattern terlalu uniform (std dev: ${stdDev.toFixed(2)})`,
          severity: 'low',
          category: 'behavior',
          score: SEVERITY_SCORES.low,
          metadata: { stdDev },
        });
      }
    }
  }

  return flags;
}

/**
 * Check velocity limits
 */
export function checkVelocityLimits(
  ipAddress: string,
  deviceFingerprintHash: string,
  gpsLat?: number,
  gpsLng?: number,
  recentSubmissions?: Array<{
    ip_address: string;
    device_fingerprint_hash: string;
    gps_lat?: number;
    gps_lng?: number;
    created_at: string;
  }>,
  maxPerIpPerHour: number = 5,
  maxPerDevicePerDay: number = 10
): FraudFlag[] {
  const flags: FraudFlag[] = [];

  if (!recentSubmissions) return flags;

  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // IP rate limit
  const recentFromIp = recentSubmissions.filter(
    s => s.ip_address === ipAddress && new Date(s.created_at).getTime() > oneHourAgo
  );

  if (recentFromIp.length >= maxPerIpPerHour) {
    flags.push({
      flag: 'IP_RATE_EXCEEDED',
      reason: `${recentFromIp.length + 1} submission dari IP yang sama dalam 1 jam (maks: ${maxPerIpPerHour})`,
      severity: 'high',
      category: 'velocity',
      score: SEVERITY_SCORES.high,
      metadata: { count: recentFromIp.length + 1, limit: maxPerIpPerHour },
    });
  }

  // Device rate limit
  const recentFromDevice = recentSubmissions.filter(
    s => s.device_fingerprint_hash === deviceFingerprintHash &&
         new Date(s.created_at).getTime() > oneDayAgo
  );

  if (recentFromDevice.length >= maxPerDevicePerDay) {
    flags.push({
      flag: 'DEVICE_RATE_EXCEEDED',
      reason: `${recentFromDevice.length + 1} submission dari device yang sama dalam 24 jam (maks: ${maxPerDevicePerDay})`,
      severity: 'high',
      category: 'velocity',
      score: SEVERITY_SCORES.high,
      metadata: { count: recentFromDevice.length + 1, limit: maxPerDevicePerDay },
    });
  }

  // GPS location clustering
  if (gpsLat !== undefined && gpsLng !== undefined) {
    const nearbySubmissions = recentSubmissions.filter(s => {
      if (!s.gps_lat || !s.gps_lng) return false;
      const dist = calculateDistance(gpsLat, gpsLng, s.gps_lat, s.gps_lng);
      return dist < 100; // Within 100 meters
    });

    const todayNearby = nearbySubmissions.filter(
      s => new Date(s.created_at).getTime() > oneDayAgo
    );

    if (todayNearby.length >= 10) {
      flags.push({
        flag: 'GPS_LOCATION_CROWDED',
        reason: `${todayNearby.length + 1} submission dari lokasi GPS yang sama dalam 24 jam`,
        severity: 'medium',
        category: 'location',
        score: SEVERITY_SCORES.medium,
        metadata: { count: todayNearby.length + 1, location: `${gpsLat},${gpsLng}` },
      });
    }
  }

  return flags;
}

/**
 * Check for duplicate customer data
 */
export async function checkDuplicateCustomer(
  customerPhone: string,
  customerName: string,
  customerEmail?: string,
  campaignId?: string,
  recentSubmissions?: Array<{
    customer_phone: string;
    customer_name: string;
    customer_email?: string;
    campaign_id?: string;
    submission_code: string;
  }>
): Promise<FraudFlag[]> {
  const flags: FraudFlag[] = [];

  if (!recentSubmissions) return flags;

  // Check phone duplicate
  const phoneMatch = recentSubmissions.find(
    s => normalizePhone(s.customer_phone) === normalizePhone(customerPhone) &&
         (s.campaign_id === campaignId || !campaignId)
  );

  if (phoneMatch) {
    flags.push({
      flag: 'DUPLICATE_PHONE',
      reason: `Nomor HP sudah terdaftar di submission ${phoneMatch.submission_code}`,
      severity: 'critical',
      category: 'device',
      score: SEVERITY_SCORES.critical,
      metadata: { existingCode: phoneMatch.submission_code },
    });
  }

  // Check name duplicate (case insensitive)
  const nameMatch = recentSubmissions.find(
    s => s.customer_name.toLowerCase().trim() === customerName.toLowerCase().trim() &&
         (s.campaign_id === campaignId || !campaignId) &&
         s.customer_phone !== customerPhone
  );

  if (nameMatch) {
    flags.push({
      flag: 'DUPLICATE_NAME',
      reason: `Nama sama dengan submission ${phoneMatch?.submission_code || nameMatch.submission_code} (phone berbeda)`,
      severity: 'medium',
      category: 'device',
      score: SEVERITY_SCORES.medium,
      metadata: { existingCode: nameMatch.submission_code },
    });
  }

  // Check email duplicate
  if (customerEmail) {
    const emailMatch = recentSubmissions.find(
      s => s.customer_email?.toLowerCase() === customerEmail.toLowerCase() &&
           (s.campaign_id === campaignId || !campaignId)
    );

    if (emailMatch) {
      flags.push({
        flag: 'DUPLICATE_EMAIL',
        reason: `Email sudah terdaftar di submission ${emailMatch.submission_code}`,
        severity: 'medium',
        category: 'device',
        score: SEVERITY_SCORES.medium,
        metadata: { existingCode: emailMatch.submission_code },
      });
    }
  }

  return flags;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

function calculateStdDev(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Haversine formula
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Run all fraud checks and return result
 */
export async function runFraudCheck(
  context: FraudCheckContext,
  recentSubmissions?: Array<{
    device_fingerprint_hash: string;
    customer_phone: string;
    customer_name: string;
    customer_email?: string;
    ip_address: string;
    gps_lat?: number;
    gps_lng?: number;
    created_at: string;
    submission_code: string;
  }>,
  recentScreenshots?: Array<{ image_hash: string; submission_id: string }>
): Promise<FraudCheckResult> {
  const flags: FraudFlag[] = [];

  // Run all checks
  const [deviceFarmFlags, duplicateFlags, botFlags, velocityFlags] = await Promise.all([
    checkDeviceFarm(context.deviceFingerprintHash, context.customerPhone, recentSubmissions || []),
    checkDuplicateCustomer(
      context.customerPhone,
      context.customerName,
      context.customerEmail,
      context.campaignId,
      recentSubmissions
    ),
    Promise.resolve(checkBotBehavior(context.timeOnPageMs, context.typingSpeeds)),
    checkVelocityLimits(
      context.ipAddress,
      context.deviceFingerprintHash,
      context.gpsLat,
      context.gpsLng,
      recentSubmissions,
      context.maxSubmissionsPerIpPerHour,
      context.maxSubmissionsPerDevicePerDay
    ),
  ]);

  flags.push(...deviceFarmFlags, ...duplicateFlags, ...botFlags, ...velocityFlags);

  // Calculate score and decision
  const score = calculateFraudScore(flags);
  const decision = determineDecision(score);
  const riskLevel = getRiskLevel(score);
  const summary = generateSummary(flags, decision);

  return {
    score,
    decision,
    flags,
    summary,
    riskLevel,
  };
}
