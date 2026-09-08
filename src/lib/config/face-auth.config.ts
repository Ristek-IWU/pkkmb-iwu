// ─────────────────────────────────────────────────────────────────────────────
// Face Auth Central Configuration
// Semua threshold & tunable parameters ada di sini.
// Kalibrasi nilai-nilai ini setelah pengujian dengan device nyata.
// ─────────────────────────────────────────────────────────────────────────────

export const FACE_AUTH_CONFIG = {
  // ── Feature flag ────────────────────────────────────────────────────────
  enabled: true,

  // ── Model paths (relative to /public) ───────────────────────────────────
  modelBasePath: '/models/face',
  modelVersion: 'face-model-v1',

  // ── Face Detection ───────────────────────────────────────────────────────
  /** Minimum detection confidence (0–1) */
  detectionMinConfidence: 0.75,
  /** Minimum face box width relative to canvas width (0–1) */
  minFaceSizeRatio: 0.15,
  /** SSD input size — tradeoff accuracy vs speed */
  ssdInputSize: 416,

  // ── Recognition ─────────────────────────────────────────────────────────
  /**
   * Cosine distance threshold. Lower = stricter.
   * 0.0 = identical, 1.0 = completely different.
   * ⚠️ WAJIB dikalibrasi: coba dengan wajah sendiri, kacamata,
   *    pencahayaan berbeda, sudut berbeda. Nilai 0.5 adalah baseline.
   */
  recognitionThreshold: 0.5,

  // ── Enrollment ───────────────────────────────────────────────────────────
  requiredSamples: 7,
  maxSamples: 10,
  /** Min confidence for an enrollment sample to be accepted */
  enrollmentMinConfidence: 0.85,

  // ── Liveness ────────────────────────────────────────────────────────────
  /**
   * Eye Aspect Ratio threshold untuk deteksi blink.
   * EAR < nilai ini = mata tertutup.
   * Nilai 0.22 adalah baseline — sesuaikan per wajah/kamera.
   */
  blinkEarThreshold: 0.22,
  /** Berapa frame berturut-turut EAR harus di bawah threshold */
  blinkFramesRequired: 2,
  /**
   * Minimum yaw degrees untuk head turn detection.
   * Dihitung dari asymmetry landmark, bukan true 3D yaw.
   */
  headTurnAsymmetryThreshold: 0.08,
  /** Timeout per challenge dalam ms */
  livenessTimeoutMs: 8000,
  /** Jumlah challenge yang harus dilewati */
  challengeCount: 3,

  // ── Performance ──────────────────────────────────────────────────────────
  /** Interval inference dalam ms (~6–7 FPS). Jangan terlalu rendah di HP. */
  inferenceIntervalMs: 150,

  // ── Session ──────────────────────────────────────────────────────────────
  /** Durasi session dalam ms (30 menit) */
  sessionLifetimeMs: 30 * 60 * 1000,

  // ── Retry / Lockout ──────────────────────────────────────────────────────
  maxLoginAttempts: 3,
  /** Cooldown setelah max attempts dalam ms (5 menit) */
  lockoutDurationMs: 5 * 60 * 1000,
} as const;

export type FaceAuthConfig = typeof FACE_AUTH_CONFIG;
