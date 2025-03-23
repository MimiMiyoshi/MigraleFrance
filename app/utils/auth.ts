import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

// scrypt関数のPromiseラッパーを作成
const scryptAsync = promisify(scrypt);

/**
 * パスワードをハッシュ化する関数
 */
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * パスワードを比較する関数
 */
export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}