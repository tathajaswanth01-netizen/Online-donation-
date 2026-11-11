const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'donation_platform_super_secret_jwt_key_2026_secure';
// Derive 32-byte key from secret
const KEY = crypto.createHash('sha256').update(SECRET).digest();

/**
 * Generate a cryptographically secure 6-digit OTP string
 */
const generate6DigitOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash the OTP using SHA-256 with server secret
 */
const hashOTP = (otp) => {
  return crypto
    .createHmac('sha256', SECRET)
    .update(otp.toString())
    .digest('hex');
};

/**
 * Verify submitted OTP against stored hash using timing-safe comparison
 */
const verifyOTPHash = (submittedOtp, storedHash) => {
  if (!submittedOtp || !storedHash) return false;
  const computedHash = hashOTP(submittedOtp);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(storedHash, 'hex')
    );
  } catch (e) {
    return false;
  }
};

/**
 * Encrypt OTP for authorized receiver persistence across refreshes
 */
const encryptOTP = (otp) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  let encrypted = cipher.update(otp.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt OTP for authorized receiver
 */
const decryptOTP = (encryptedString) => {
  try {
    if (!encryptedString || !encryptedString.includes(':')) return null;
    const [ivHex, cipherText] = encryptedString.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return null;
  }
};

module.exports = {
  generate6DigitOTP,
  hashOTP,
  verifyOTPHash,
  encryptOTP,
  decryptOTP
};
