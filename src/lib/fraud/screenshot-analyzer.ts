/**
 * Screenshot Analyzer Service
 * Image fingerprinting (pHash), metadata extraction, similarity detection
 */

export interface ScreenshotMetadata {
  width: number;
  height: number;
  fileSize: number;
  aspectRatio: number;
  type: string;
  lastModified: number;
}

export interface ScreenshotAnalysis {
  metadata: ScreenshotMetadata;
  pHash: string;
  dHash: string;
  averageColor: string;
  dominantColors: string[];
  exif: Record<string, any>;
  isSuspicious: boolean;
  suspiciousReasons: string[];
}

/**
 * Calculate perceptual hash (pHash) for image similarity
 * Simplified implementation - for production use a proper library
 */
async function calculatePHash(imageData: ImageData): Promise<string> {
  // Resize to 32x32
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Create a temp canvas with original image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);

  // Draw scaled
  ctx.drawImage(tempCanvas, 0, 0, size, size);

  // Get grayscale values
  const scaledData = ctx.getImageData(0, 0, size, size);
  const grayscale: number[] = [];

  for (let i = 0; i < scaledData.data.length; i += 4) {
    const gray = Math.round(0.299 * scaledData.data[i] +
                            0.587 * scaledData.data[i + 1] +
                            0.114 * scaledData.data[i + 2]);
    grayscale.push(gray);
  }

  // Calculate DCT (simplified - just use average comparison)
  const avg = grayscale.reduce((a, b) => a + b, 0) / grayscale.length;

  // Generate hash based on comparison to average
  let hash = '';
  for (const pixel of grayscale) {
    hash += pixel > avg ? '1' : '0';
  }

  // Convert to hex
  let hexHash = '';
  for (let i = 0; i < hash.length; i += 4) {
    const nibble = hash.slice(i, i + 4);
    hexHash += parseInt(nibble, 2).toString(16);
  }

  return hexHash;
}

/**
 * Calculate difference hash (dHash) for fast comparison
 */
async function calculateDHash(imageData: ImageData): Promise<string> {
  const size = 9; // 9 pixels wide, 8 tall
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size - 1;
  const ctx = canvas.getContext('2d')!;

  // Create temp canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);

  // Draw scaled
  ctx.drawImage(tempCanvas, 0, 0, size, size - 1);

  // Get grayscale values
  const scaledData = ctx.getImageData(0, 0, size, size - 1);
  const grayscale: number[] = [];

  for (let i = 0; i < scaledData.data.length; i += 4) {
    const gray = Math.round(0.299 * scaledData.data[i] +
                            0.587 * scaledData.data[i + 1] +
                            0.114 * scaledData.data[i + 2]);
    grayscale.push(gray);
  }

  // Generate hash - compare each pixel to the one to its right
  let hash = '';
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size; col++) {
      const idx = row * size + col;
      const rightIdx = idx + 1;
      hash += grayscale[idx] > grayscale[rightIdx] ? '1' : '0';
    }
  }

  // Convert to hex
  let hexHash = '';
  for (let i = 0; i < hash.length; i += 4) {
    const nibble = hash.slice(i, i + 4);
    hexHash += parseInt(nibble, 2).toString(16);
  }

  return hexHash;
}

/**
 * Calculate hamming distance between two hashes
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    // Convert hex to binary for different length hashes
    const bin1 = parseInt(hash1, 16).toString(2).padStart(hash1.length * 4, '0');
    const bin2 = parseInt(hash2, 16).toString(2).padStart(hash2.length * 4, '0');
    let distance = 0;
    const maxLen = Math.max(bin1.length, bin2.length);
    for (let i = 0; i < maxLen; i++) {
      if (bin1[i] !== bin2[i]) distance++;
    }
    return distance;
  }

  const bin1 = parseInt(hash1, 16).toString(2).padStart(hash1.length * 4, '0');
  const bin2 = parseInt(hash2, 16).toString(2).padStart(hash2.length * 4, '0');

  let distance = 0;
  for (let i = 0; i < bin1.length; i++) {
    if (bin1[i] !== bin2[i]) distance++;
  }
  return distance;
}

/**
 * Calculate similarity percentage (0-100)
 */
export function calculateSimilarity(hash1: string, hash2: string): number {
  const maxBits = Math.max(hash1.length * 4, hash2.length * 4);
  const distance = hammingDistance(hash1, hash2);
  return Math.round((1 - distance / maxBits) * 100);
}

/**
 * Extract dominant colors using k-means clustering (simplified)
 */
async function extractDominantColors(imageData: ImageData, k: number = 5): Promise<string[]> {
  const pixels: [number, number, number][] = [];
  const data = imageData.data as unknown as number[];

  // Sample pixels
  for (let i = 0; i < data.length; i += 4) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  // Simple clustering
  const centers: [number, number, number][] = [];

  // Initialize centers with random pixels
  for (let i = 0; i < k; i++) {
    centers.push(pixels[Math.floor(Math.random() * pixels.length)]);
  }

  // Run a few iterations
  for (let iter = 0; iter < 5; iter++) {
    const clusters: [number, number, number][][] = Array(k).fill(null).map(() => []);

    // Assign pixels to nearest center
    for (const pixel of pixels) {
      let minDist = Infinity;
      let nearest = 0;
      for (let i = 0; i < centers.length; i++) {
        const dist = Math.sqrt(
          Math.pow(pixel[0] - centers[i][0], 2) +
          Math.pow(pixel[1] - centers[i][1], 2) +
          Math.pow(pixel[2] - centers[i][2], 2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      }
      clusters[nearest].push(pixel);
    }

    // Update centers
    for (let i = 0; i < k; i++) {
      if (clusters[i].length > 0) {
        centers[i] = [
          Math.round(clusters[i].reduce((s, p) => s + p[0], 0) / clusters[i].length),
          Math.round(clusters[i].reduce((s, p) => s + p[1], 0) / clusters[i].length),
          Math.round(clusters[i].reduce((s, p) => s + p[2], 0) / clusters[i].length),
        ];
      }
    }
  }

  // Sort by cluster size
  const counts = centers.map((_, i) => ({ center: centers[i], count: 0 }));
  for (const pixel of pixels) {
    let minDist = Infinity;
    let nearest = 0;
    for (let i = 0; i < centers.length; i++) {
      const dist = Math.sqrt(
        Math.pow(pixel[0] - centers[i][0], 2) +
        Math.pow(pixel[1] - centers[i][1], 2) +
        Math.pow(pixel[2] - centers[i][2], 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    }
    counts[nearest].count++;
  }

  counts.sort((a, b) => b.count - a.count);

  return counts.map(c => `rgb(${c.center[0]},${c.center[1]},${c.center[2]})`);
}

/**
 * Extract EXIF-like metadata from image
 */
function extractMetadata(file: File, img: HTMLImageElement): ScreenshotMetadata {
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    fileSize: file.size,
    aspectRatio: img.naturalWidth / img.naturalHeight,
    type: file.type,
    lastModified: file.lastModified,
  };
}

/**
 * Analyze a screenshot file
 */
export async function analyzeScreenshot(file: File): Promise<ScreenshotAnalysis> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = async (e) => {
      img.onload = async () => {
        // Create canvas for image processing
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Calculate hashes
        const pHash = await calculatePHash(imageData);
        const dHash = await calculateDHash(imageData);

        // Extract colors
        const dominantColors = await extractDominantColors(imageData);
        const avgColor = dominantColors[0] || 'rgb(0,0,0)';

        // Check for suspicious patterns
        const suspiciousReasons: string[] = [];

        // Check file size (too small = likely fake)
        if (file.size < 5000) {
          suspiciousReasons.push('File terlalu kecil (<5KB)');
        }

        // Check resolution (too low = stock photo)
        if (img.naturalWidth < 100 || img.naturalHeight < 100) {
          suspiciousReasons.push('Resolution terlalu rendah');
        }

        // Check aspect ratio (unusual = suspicious)
        const ratio = img.naturalWidth / img.naturalHeight;
        if (ratio < 0.5 || ratio > 2.5) {
          suspiciousReasons.push('Aspect ratio tidak biasa');
        }

        // Check last modified (future date = fake)
        const now = Date.now();
        if (file.lastModified > now + 60000) {
          suspiciousReasons.push('Tanggal file dimodifikasi di masa depan');
        }

        resolve({
          metadata: extractMetadata(file, img),
          pHash,
          dHash,
          averageColor: avgColor,
          dominantColors,
          exif: {},
          isSuspicious: suspiciousReasons.length > 0,
          suspiciousReasons,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compare two screenshots for similarity
 */
export async function compareScreenshots(
  file1: File,
  file2: File
): Promise<{ similarity: number; isIdentical: boolean; isSuspicious: boolean }> {
  const [analysis1, analysis2] = await Promise.all([
    analyzeScreenshot(file1),
    analyzeScreenshot(file2),
  ]);

  const pHashSimilarity = calculateSimilarity(analysis1.pHash, analysis2.pHash);
  const dHashSimilarity = calculateSimilarity(analysis1.dHash, analysis2.dHash);

  // Average similarity
  const similarity = Math.round((pHashSimilarity + dHashSimilarity) / 2);

  return {
    similarity,
    isIdentical: similarity > 95,
    isSuspicious: similarity > 85 && (analysis1.isSuspicious || analysis2.isSuspicious),
  };
}

/**
 * Check if multiple screenshots are from the same source (stock photo/fabrication)
 */
export async function detectFabrication(screenshots: File[]): Promise<{
  isFabricated: boolean;
  groups: { similarity: number; files: number[] }[];
  reasons: string[];
}> {
  if (screenshots.length < 2) {
    return { isFabricated: false, groups: [], reasons: [] };
  }

  const analyses = await Promise.all(screenshots.map(analyzeScreenshot));
  const groups: { similarity: number; files: number[] }[] = [];
  const reasons: string[] = [];

  // Compare all pairs
  for (let i = 0; i < analyses.length; i++) {
    for (let j = i + 1; j < analyses.length; j++) {
      const similarity = calculateSimilarity(analyses[i].pHash, analyses[j].pHash);

      if (similarity > 85) {
        // Find existing group
        let foundGroup = groups.find(g => g.files.includes(i) || g.files.includes(j));

        if (foundGroup) {
          if (!foundGroup.files.includes(i)) foundGroup.files.push(i);
          if (!foundGroup.files.includes(j)) foundGroup.files.push(j);
          foundGroup.similarity = Math.max(foundGroup.similarity, similarity);
        } else {
          groups.push({ similarity, files: [i, j] });
        }

        reasons.push(`Screenshot #${i + 1} dan #${j + 1} mirip ${similarity}% (kemungkinan stock photo)`);
      }
    }
  }

  return {
    isFabricated: groups.length > 0,
    groups,
    reasons,
  };
}
