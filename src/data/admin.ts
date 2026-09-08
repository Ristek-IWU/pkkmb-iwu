// ─────────────────────────────────────────────────────────────────────────────
// Admin Accounts — PKKMB IWU
//
// ⚠️  SECURITY DISCLAIMER
// Ini adalah client-side authentication untuk MVP/internal use.
// Password disimpan sebagai SHA-256 hash — BUKAN plaintext.
// SHA-256 di client BUKAN secure authentication boundary.
// Untuk produksi dengan privilege tinggi, gunakan WebAuthn atau
// server-side authentication.
//
// ⚠️  JANGAN menambahkan secret, API key, atau token di file ini.
// ─────────────────────────────────────────────────────────────────────────────

import { AdminAccount } from '@/types/face-auth';

/**
 * Daftar admin PKKMB IWU.
 *
 * Password default: OktaIWU2026!
 * Hash: SHA-256("OktaIWU2026!")
 *
 * Ganti passwordHash setelah deployment pertama dengan menjalankan:
 *   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('password_baru').digest('hex'))"
 */
export const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'okta-ramdani',
    username: 'okta',
    displayName: 'Okta Ramdani',
    role: 'Ketua Himpunan Mahasiswa Informatika',
    // SHA-256 of "OktaIWU2026!"
    passwordHash:
      'ae76654062c3bf99c945e80feaa562373fbf6538f969cab359a8f2efc5d5b39a',
  },
];

/**
 * Cari admin berdasarkan username (case-insensitive).
 */
export function findAdminByUsername(username: string): AdminAccount | undefined {
  return ADMIN_ACCOUNTS.find(
    (a) => a.username.toLowerCase() === username.toLowerCase()
  );
}
