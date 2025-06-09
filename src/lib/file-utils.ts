/**
 * Secure File Utilities
 * Client-side file validation and utility functions
 * No API keys required - safe for frontend use
 */

// Supported file types for Gemini API (client-side validation only)
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
];

const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/mov',
  'video/avi',
  'video/x-flv',
  'video/mpg',
  'video/webm',
  'video/wmv',
  'video/3gpp'
];

const SUPPORTED_AUDIO_TYPES = [
  'audio/wav',
  'audio/mp3',
  'audio/aiff',
  'audio/aac',
  'audio/ogg',
  'audio/flac'
];

const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'text/html',
  'text/css',
  'text/javascript',
  'text/typescript',
  'application/rtf'
];

/**
 * Check if a file type is supported by Gemini API
 * @param file - File to check
 * @returns boolean indicating if file type is supported
 */
export function isSupportedFileType(file: File): boolean {
  const type = file.type.toLowerCase();
  
  return [
    ...SUPPORTED_IMAGE_TYPES,
    ...SUPPORTED_VIDEO_TYPES,
    ...SUPPORTED_AUDIO_TYPES,
    ...SUPPORTED_DOCUMENT_TYPES
  ].includes(type);
}

/**
 * Check if a file is a video file
 * @param file - File to check
 * @returns boolean indicating if file is a video
 */
export function isVideoFile(file: File): boolean {
  return SUPPORTED_VIDEO_TYPES.includes(file.type.toLowerCase());
}

/**
 * Check if a file is an image file
 * @param file - File to check
 * @returns boolean indicating if file is an image
 */
export function isImageFile(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(file.type.toLowerCase());
}

/**
 * Check if a file is an audio file
 * @param file - File to check
 * @returns boolean indicating if file is audio
 */
export function isAudioFile(file: File): boolean {
  return SUPPORTED_AUDIO_TYPES.includes(file.type.toLowerCase());
}

/**
 * Check if a file is a document
 * @param file - File to check
 * @returns boolean indicating if file is a document
 */
export function isDocumentFile(file: File): boolean {
  return SUPPORTED_DOCUMENT_TYPES.includes(file.type.toLowerCase());
}

/**
 * Get a human-readable file type description
 * @param file - File to describe
 * @returns string description of file type
 */
export function getFileTypeDescription(file: File): string {
  if (isImageFile(file)) return 'Image';
  if (isVideoFile(file)) return 'Video';
  if (isAudioFile(file)) return 'Audio';
  if (isDocumentFile(file)) return 'Document';
  return 'Unknown';
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file size limits
 * @param file - File to validate
 * @returns object with validation result and message
 */
export function validateFileSize(file: File): { valid: boolean; message?: string } {
  const maxSize = 20 * 1024 * 1024; // 20MB general limit
  
  if (file.size > maxSize) {
    return {
      valid: false,
      message: `File "${file.name}" is too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(maxSize)}.`
    };
  }
  
  return { valid: true };
}
