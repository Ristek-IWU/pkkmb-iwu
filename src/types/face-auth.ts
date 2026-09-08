// ─────────────────────────────────────────────────────────────────────────────
// Face Authentication Types
// PKKMB IWU — MVP client-side auth (tidak untuk production tingkat tinggi)
// ─────────────────────────────────────────────────────────────────────────────

// ── Face Detection ────────────────────────────────────────────────────────────

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceDetectionResult {
  detected: boolean;
  faceCount: number;
  box?: FaceBox;
  confidence?: number;
  landmarks?: FaceLandmarks;
}

export interface FaceLandmarks {
  /** 68 landmark points [x, y] */
  positions: Array<{ x: number; y: number }>;
  leftEye: Array<{ x: number; y: number }>;
  rightEye: Array<{ x: number; y: number }>;
  nose: { x: number; y: number };
  jawLeft: { x: number; y: number };
  jawRight: { x: number; y: number };
}

// ── Liveness ──────────────────────────────────────────────────────────────────

export type LivenessChallenge = 'BLINK' | 'TURN_LEFT' | 'TURN_RIGHT';

export interface LivenessChallengeState {
  challenge: LivenessChallenge;
  passed: boolean;
  attemptStartedAt: number;
}

export interface LivenessResult {
  success: boolean;
  challengesPassed: number;
  failReason?: 'timeout' | 'max-attempts' | 'detection-lost';
}

// ── Embedding & Recognition ───────────────────────────────────────────────────

/** 128-dimensional face descriptor from face_recognition_model */
export type FaceEmbedding = number[];

export interface EmbeddingMatchResult {
  matched: boolean;
  distance: number;
  bestEmbeddingIndex: number;
}

// ── Face Profile (stored in IndexedDB) ───────────────────────────────────────

export interface FaceProfile {
  adminId: string;
  version: number;
  modelVersion: string;
  embeddings: FaceEmbedding[];
  createdAt: string;
  updatedAt: string;
}

// ── Admin Session ─────────────────────────────────────────────────────────────

export interface AdminSession {
  adminId: string;
  adminName: string;
  authenticatedAt: string;
  method: 'password+face';
  expiresAt: string;
}

// ── Auth State Machine ────────────────────────────────────────────────────────

export type FaceAuthState =
  | 'idle'
  | 'loading-models'
  | 'requesting-camera'
  | 'detecting'
  | 'face-detected'
  | 'liveness'
  | 'recognizing'
  | 'success'
  | 'failed'
  | 'error';

export type FaceAuthErrorCode =
  | 'camera-denied'
  | 'camera-unavailable'
  | 'no-face'
  | 'multiple-faces'
  | 'face-too-small'
  | 'liveness-failed'
  | 'liveness-timeout'
  | 'recognition-failed'
  | 'model-load-failed'
  | 'browser-unsupported'
  | 'no-face-profile'
  | 'max-attempts-exceeded'
  | 'storage-unavailable';

export interface FaceAuthError {
  code: FaceAuthErrorCode;
  message: string;
}

// ── Enrollment ────────────────────────────────────────────────────────────────

export type EnrollmentState =
  | 'idle'
  | 'loading-models'
  | 'requesting-camera'
  | 'capturing'
  | 'saving'
  | 'done'
  | 'error';

export interface EnrollmentSample {
  embedding: FaceEmbedding;
  capturedAt: string;
}

// ── Admin Account ─────────────────────────────────────────────────────────────

export interface AdminAccount {
  id: string;
  username: string;
  displayName: string;
  role: string;
  /** SHA-256 hex hash of password — never plaintext */
  passwordHash: string;
}
