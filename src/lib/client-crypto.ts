'use client';

/**
 * Browser-based encryption using Web Crypto API
 * this is for encrypting GitHub tokens in localStorage
 */

const ALGORITHM = 'AES-GCM';

/**
 * generate a device-specific password using browser fingerprint
 * this creates a unique key per device/browser
 */
async function getDevicePassword(): Promise<string> {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.colorDepth.toString(),
    screen.width.toString(),
    screen.height.toString(),
  ].join('|');

  // hash the fingerprint to create a consistent password
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // convert to base64
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(String.fromCharCode(...hashArray));
}

/**
 * derive encryption key from password using PBKDF2
 */
async function deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * encrypt data using Web Crypto API (browser-side)
 * @param data - The string to encrypt
 * @returns Base64-encoded encrypted data with salt and IV
 */
export async function encryptData(data: string): Promise<string> {
  try {
    const password = await getDevicePassword();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // generate random salt and IV
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);

    const iv = new Uint8Array(12); // gcm uses 12-byte IV
    crypto.getRandomValues(iv);

    // derive key from password
    const key = await deriveKey(password, salt.buffer);

    // encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      dataBuffer
    );

    // combine salt + iv + encrypted data
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(
      salt.length + iv.length + encryptedArray.length
    );
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedArray, salt.length + iv.length);

    // convert to base64
    return btoa(String.fromCharCode(...Array.from(combined)));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * decrypt data using Web Crypto API (browser-side)
 * @param encryptedData - Base64-encoded encrypted data
 * @returns Decrypted string
 */
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    const password = await getDevicePassword();

    // decode base64
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

    // extract salt, IV, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28); // 16 + 12
    const encrypted = combined.slice(28);

    // derive key from password
    const key = await deriveKey(password, salt.buffer);

    // decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      encrypted
    );

    // convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * check if the Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  console.log('checking if crypto is available', typeof window !== 'undefined' && !!window.crypto?.subtle);
  return typeof window !== 'undefined' && !!window.crypto?.subtle;
}
