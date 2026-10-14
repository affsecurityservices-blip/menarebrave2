import { Platform } from 'react-native';
import { IMGBB_API_KEY, IMGBB_UPLOAD_URL } from '../utils/constants';

// Allowed MIME types and extensions (Strictly JPG/JPEG & PNG)
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB maximum

/**
 * Validates magic bytes signature from base64 string to prevent file extension spoofing
 * JPEG magic bytes: FF D8 FF -> Base64 begins with "/9j/"
 * PNG magic bytes: 89 50 4E 47 -> Base64 begins with "iVBORw0KGgo"
 */
export function verifyImageMagicBytes(base64Data) {
  if (!base64Data || typeof base64Data !== 'string') return false;

  // Clean any data URI prefix if present
  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z]+;base64,/, '').trim();

  // Check JPEG signature
  const isJpeg = cleanBase64.startsWith('/9j/');
  // Check PNG signature
  const isPng = cleanBase64.startsWith('iVBORw0KGgo') || cleanBase64.startsWith('iVBORw');

  return isJpeg || isPng;
}

/**
 * Validates an image asset for file size, extension, MIME type, and magic bytes.
 * Throws a descriptive security error if any check fails.
 */
export function validateImageSecurity(asset) {
  if (!asset) {
    throw new Error('No image file selected.');
  }

  // 1. Check file size
  if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (asset.fileSize / (1024 * 1024)).toFixed(1);
    throw new Error(`Image size (${sizeInMb}MB) exceeds the 5MB maximum limit.`);
  }

  // 2. Extract and check extension
  const uri = asset.uri || asset.fileName || '';
  const cleanUri = uri.split('?')[0].split('#')[0];
  const parts = cleanUri.split('.');
  const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';

  // In some pickers or web, mimeType is provided instead of extension
  const mimeType = (asset.mimeType || asset.type || '').toLowerCase();

  const hasValidExt = ext ? ALLOWED_EXTENSIONS.has(ext) : false;
  const hasValidMime = mimeType ? ALLOWED_MIME_TYPES.has(mimeType) : false;

  if (!hasValidExt && !hasValidMime) {
    throw new Error('Only JPG and PNG image formats are allowed.');
  }

  // 3. Verify magic bytes if base64 is available
  if (asset.base64) {
    const isValidSignature = verifyImageMagicBytes(asset.base64);
    if (!isValidSignature) {
      throw new Error('Invalid or corrupted image format. Only authentic JPG and PNG files are accepted.');
    }
  }

  // 4. Return safe normalized extension
  const safeExt = hasValidExt ? (ext === 'jpeg' ? 'jpg' : ext) : (mimeType.includes('png') ? 'png' : 'jpg');
  return {
    valid: true,
    extension: safeExt,
  };
}

/**
 * Sanitizes a URL returned by an external hosting service.
 * Ensures strict HTTPS and authentic ImgBB domain matching.
 */
export function sanitizeImgBBUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const trimmed = rawUrl.trim();
  // Must start with https://
  if (!trimmed.startsWith('https://')) return null;

  try {
    // Check hostname
    const match = trimmed.match(/^https:\/\/([a-zA-Z0-9-]+\.)?ibb\.co\/.+$/);
    if (!match) return null;

    // Disallow dangerous protocols / scripts in query or hash
    if (/[<>"'`\\;\(\)]/.test(trimmed)) return null;

    return trimmed;
  } catch {
    return null;
  }
}

/**
 * Uploads an image asset to ImgBB securely.
 * Supports React Native Mobile (file URI) and Web (Blob/File or Base64).
 */
export async function uploadImageToImgBB(asset) {
  // Pre-upload security inspection
  const validation = validateImageSecurity(asset);

  if (!IMGBB_API_KEY) {
    throw new Error('ImgBB API key is not configured.');
  }

  const safeFileName = `mab_post_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${validation.extension}`;

  const formData = new FormData();
  formData.append('key', IMGBB_API_KEY);
  formData.append('name', safeFileName);

  // If base64 is available, use it directly (ImgBB prefers base64 or file binary)
  if (asset.base64) {
    const cleanBase64 = asset.base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    formData.append('image', cleanBase64);
  } else if (Platform.OS === 'web' && asset.file) {
    // Web File object
    formData.append('image', asset.file, safeFileName);
  } else {
    // React Native Mobile URI
    const uri = asset.uri;
    const type = validation.extension === 'png' ? 'image/png' : 'image/jpeg';
    formData.append('image', {
      uri,
      name: safeFileName,
      type,
    });
  const endpoint = `${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(IMGBB_API_KEY)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMessage = 'Image upload failed. Please try again.';
    try {
      const errJson = JSON.parse(errText);
      if (errJson?.error?.message) {
        errMessage = `Upload error: ${errJson.error.message}`;
      }
    } catch {
      // fallback
    }
    throw new Error(errMessage);
  }

  const result = await response.json();

  if (!result?.success || !result?.data?.url) {
    throw new Error(result?.error?.message || 'Failed to retrieve image URL from host.');
  }

  // Sanitize the returned URL
  const verifiedUrl = sanitizeImgBBUrl(result.data.display_url || result.data.url);
  if (!verifiedUrl) {
    throw new Error('Security check failed: Untrusted image URL returned from server.');
  }

  return {
    success: true,
    url: verifiedUrl,
    displayUrl: verifiedUrl,
    thumbUrl: sanitizeImgBBUrl(result.data.thumb?.url) || verifiedUrl,
    width: result.data.width,
    height: result.data.height,
    format: validation.extension.toUpperCase(),
  };
}
