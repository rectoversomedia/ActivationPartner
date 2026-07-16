/**
 * Device Fingerprinting Service
 * Generates unique device hash from multiple signals
 */

export interface DeviceFingerprint {
  hash: string;
  deviceInfo: string;
  canvasFingerprint: string;
  webglFingerprint: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  colorDepth: number;
  deviceMemory: number | null;
  hardwareConcurrency: number | null;
}

export interface FingerprintComponents {
  userAgent: string;
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  colorDepth: number;
  deviceMemory: number | null;
  hardwareConcurrency: number | null;
  canvas: string;
  webgl: string;
  webglVendor: string;
  webglRenderer: string;
}

/**
 * Generate MD5 hash (simple implementation)
 */
async function md5(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get canvas fingerprint
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    canvas.width = 200;
    canvas.height = 50;

    // Draw text with various styles
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('ActivationPartner FP', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Fingerprint Test', 4, 27);

    // Add some noise
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(190, 40);
    ctx.stroke();

    return canvas.toDataURL().slice(-50);
  } catch {
    return 'canvas-error';
  }
}

/**
 * Get WebGL fingerprint
 */
function getWebGLFingerprint(): { fingerprint: string; vendor: string; renderer: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) {
      return { fingerprint: 'no-webgl', vendor: 'unknown', renderer: 'unknown' };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR);
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);

    const fingerprint = `${vendor}~${renderer}`.slice(0, 100);
    return { fingerprint, vendor, renderer };
  } catch {
    return { fingerprint: 'webgl-error', vendor: 'unknown', renderer: 'unknown' };
  }
}

/**
 * Collect all fingerprint components from browser
 */
export function collectFingerprintComponents(): FingerprintComponents {
  return {
    userAgent: navigator.userAgent,
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    colorDepth: screen.colorDepth,
    deviceMemory: (navigator as any).deviceMemory || null,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint().fingerprint,
    webglVendor: getWebGLFingerprint().vendor,
    webglRenderer: getWebGLFingerprint().renderer,
  };
}

/**
 * Generate device fingerprint hash
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const components = collectFingerprintComponents();

  // Create deterministic string from components
  const rawString = [
    components.userAgent.slice(0, 100),
    components.screen,
    components.timezone,
    components.language,
    components.platform,
    components.canvas.slice(-30),
    components.webgl.slice(0, 50),
  ].join('|');

  const hash = await md5(rawString);

  // Format device info for display
  let deviceInfo = 'Unknown';
  const ua = components.userAgent;
  if (ua.includes('iPhone')) deviceInfo = 'iOS-iPhone';
  else if (ua.includes('iPad')) deviceInfo = 'iOS-iPad';
  else if (ua.includes('Android')) {
    if (ua.includes('Samsung')) deviceInfo = 'Android-Samsung';
    else if (ua.includes('Xiaomi')) deviceInfo = 'Android-Xiaomi';
    else if (ua.includes('OPPO')) deviceInfo = 'Android-OPPO';
    else if (ua.includes('Vivo')) deviceInfo = 'Android-Vivo';
    else if (ua.includes('Huawei')) deviceInfo = 'Android-Huawei';
    else deviceInfo = 'Android-Other';
  }
  else if (ua.includes('Mac')) deviceInfo = 'macOS';
  else if (ua.includes('Windows')) deviceInfo = 'Windows';
  else if (ua.includes('Linux')) deviceInfo = 'Linux';

  return {
    hash,
    deviceInfo,
    canvasFingerprint: components.canvas.slice(-32),
    webglFingerprint: components.webgl.slice(0, 64),
    screenResolution: components.screen,
    timezone: components.timezone,
    language: components.language,
    platform: components.platform,
    colorDepth: components.colorDepth,
    deviceMemory: components.deviceMemory,
    hardwareConcurrency: components.hardwareConcurrency,
  };
}

/**
 * Check if device is likely a bot or emulator
 */
export function isSuspiciousDevice(): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check for headless browser
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('headless') || ua.includes('phantom') || ua.includes('puppeteer')) {
    reasons.push('Headless browser detected');
  }

  // Check for missing canvas
  try {
    const canvas = document.createElement('canvas');
    if (!canvas.getContext('2d')) {
      reasons.push('Canvas not supported');
    }
  } catch {
    reasons.push('Canvas error');
  }

  // Check for missing webgl
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) {
      reasons.push('WebGL not supported');
    }
  } catch {
    reasons.push('WebGL error');
  }

  // Check for automation properties
  if ((window as any).webdriver || (navigator as any).webdriver) {
    reasons.push('Selenium/webdriver detected');
  }

  // Check for missing plugins
  if (navigator.plugins.length === 0) {
    reasons.push('No browser plugins');
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}

/**
 * Check for VPN/Proxy indicators
 * Note: This is client-side only, real detection needs server-side IP analysis
 */
export function getNetworkInfo(): { isVPNSuspected: boolean; connectionType: string } {
  let isVPNSuspected = false;
  let connectionType = 'unknown';

  // Check connection type
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (conn) {
    connectionType = conn.effectiveType || conn.type || 'unknown';
    // VPN often shows as cellular or has low quality connection
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
      isVPNSuspected = true;
    }
  }

  // Check if online status is unreliable
  if (!navigator.onLine) {
    isVPNSuspected = true;
    connectionType = 'offline';
  }

  return { isVPNSuspected, connectionType };
}
