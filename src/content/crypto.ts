/**
 * Local encryption utilities for profile data
 */

/**
 * Derive a key from a passphrase using PBKDF2
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random salt
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate a random IV
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Encrypt a JSON object to a byte array
 */
export async function encryptProfile(profile: any, passphrase: string): Promise<Uint8Array> {
  try {
    // Check if crypto.subtle is available
    if (!crypto.subtle) {
      throw new Error('Web Crypto API not available');
    }
    
    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKey(passphrase, salt);
    
    const jsonString = JSON.stringify(profile);
    const data = new TextEncoder().encode(jsonString);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    
    // Combine salt + iv + encrypted data
    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    return result;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error(`Failed to encrypt profile data: ${error.message}`);
  }
}

/**
 * Decrypt a byte array back to a JSON object
 */
export async function decryptProfile(encryptedData: Uint8Array, passphrase: string): Promise<any> {
  try {
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 28);
    const encrypted = encryptedData.slice(28);
    
    const key = await deriveKey(passphrase, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    const jsonString = new TextDecoder().decode(decrypted);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt profile data. Check your passphrase.');
  }
}

/**
 * Convert Uint8Array to base64 string for storage
 */
export function arrayToBase64(array: Uint8Array): string {
  const chunkSize = 0x800; // keep spreads small to avoid stack issues
  const chunks: string[] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.subarray(i, i + chunkSize);
    chunks.push(String.fromCharCode(...chunk));
  }
  return btoa(chunks.join(''));
}

/**
 * Convert base64 string back to Uint8Array
 */
export function base64ToArray(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const result = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    result[i] = binaryString.charCodeAt(i);
  }
  return result;
}

/**
 * Simple fallback encryption (not as secure but works everywhere)
 */
function simpleEncrypt(data: string, password: string): string {
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ password.charCodeAt(i % password.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(encrypted);
}

/**
 * Simple fallback decryption
 */
function simpleDecrypt(encryptedData: string, password: string): string {
  try {
    const data = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ password.charCodeAt(i % password.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Save encrypted profile to chrome.storage.local
 */
export async function saveEncryptedProfile(profile: any, passphrase: string): Promise<void> {
  try {
    // Try Web Crypto API first
    if (crypto.subtle) {
      const encryptedData = await encryptProfile(profile, passphrase);
      const base64Data = arrayToBase64(encryptedData);
      
      await chrome.storage.local.set({
        encryptedProfile: base64Data,
        profileTimestamp: Date.now(),
        encryptionMethod: 'webcrypto'
      });
    } else {
      // Fallback to simple encryption
      const jsonString = JSON.stringify(profile);
      const encryptedData = simpleEncrypt(jsonString, passphrase);
      
      await chrome.storage.local.set({
        encryptedProfile: encryptedData,
        profileTimestamp: Date.now(),
        encryptionMethod: 'simple'
      });
    }
  } catch (error) {
    console.error('Failed to save profile:', error);
    throw error;
  }
}

/**
 * Load and decrypt profile from chrome.storage.local
 */
export async function loadEncryptedProfile(passphrase: string): Promise<any> {
  try {
    const result = await chrome.storage.local.get(['encryptedProfile', 'encryptionMethod']);
    
    if (!result.encryptedProfile) {
      throw new Error('No encrypted profile found');
    }
    
    if (result.encryptionMethod === 'simple') {
      // Use simple decryption
      const decryptedString = simpleDecrypt(result.encryptedProfile, passphrase);
      return JSON.parse(decryptedString);
    } else {
      // Use Web Crypto API decryption
      const encryptedData = base64ToArray(result.encryptedProfile);
      return await decryptProfile(encryptedData, passphrase);
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
    throw error;
  }
}

/**
 * Clear stored profile data
 */
export async function clearStoredProfile(): Promise<void> {
  await chrome.storage.local.remove(['encryptedProfile', 'profileTimestamp', 'currentProfile']);
}
