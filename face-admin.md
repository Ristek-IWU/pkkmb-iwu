# FACE-ADMIN.md

## Technical Specification --- Client-Side Face Authentication for IWU Admin

> Dokumen ini adalah **technical implementation brief** untuk AI coding
> agent. Tujuannya agar fitur Face Admin diimplementasikan secara
> konsisten, aman untuk konteks MVP, modular, dan tetap kompatibel
> dengan deployment Next.js Static Export di cPanel.

------------------------------------------------------------------------

# 1. Tujuan

Tambahkan fitur autentikasi admin berbasis wajah ke project Next.js yang
sudah ada.

Pipeline wajib:

``` text
Admin Login
    ↓
Face Detection
    ↓
Liveness Detection
    ↓
Face Recognition
    ↓
Authentication
    ↓
Admin Dashboard
```

Fitur ini harus berjalan tanpa Laravel/backend terpisah untuk MVP.

Semua pemrosesan wajah dilakukan di browser.

Namun, AI coding agent HARUS memahami bahwa client-only authentication
bukan security boundary yang kuat. Karena itu implementasi ini ditujukan
untuk MVP/internal admin, bukan sistem dengan security requirement
tingkat tinggi.

Untuk production dengan privilege tinggi, rencanakan migrasi ke
WebAuthn/Passkey dan/atau server-side verification.

------------------------------------------------------------------------

# 2. Konteks Project

Project utama:

-   Next.js
-   TypeScript
-   App Router
-   Tailwind CSS
-   Mantine UI
-   Fabric.js untuk Twibbon Studio
-   Static Export
-   Deployment di cPanel

Face Admin adalah feature/module baru di project yang sama.

Jangan membuat project baru.

Jangan membuat Laravel.

Jangan menambahkan database server hanya untuk fitur ini.

------------------------------------------------------------------------

# 3. Prinsip Utama

## 3.1 Client-side first

Face processing dilakukan:

``` text
Camera
  ↓
Browser
  ↓
Detection
  ↓
Liveness
  ↓
Embedding
  ↓
Comparison
```

Foto wajah tidak perlu di-upload ke server.

## 3.2 Jangan menyimpan foto wajah sebagai credential

Jangan menggunakan:

``` text
admin_face.jpg
```

sebagai credential utama.

Gunakan face embedding.

Contoh konseptual:

``` ts
type FaceEmbedding = number[];
```

Embedding adalah representasi numerik wajah.

## 3.3 Face recognition bukan sekadar image comparison

Jangan membandingkan:

``` text
image A === image B
```

Gunakan embedding + distance/similarity.

------------------------------------------------------------------------

# 4. Security Disclaimer

Implementasi client-only memiliki keterbatasan.

Contoh:

``` text
Browser
  ↓
Face Match
  ↓
isAuthenticated = true
```

dapat dimanipulasi oleh pengguna yang menguasai browser.

Karena itu:

-   jangan mengklaim ini sebagai authentication tingkat tinggi;
-   jangan menyimpan secret API/database di client;
-   jangan menganggap IndexedDB sebagai trusted database;
-   jangan menaruh password plaintext;
-   jangan menjadikan face recognition sebagai satu-satunya perlindungan
    untuk operasi sangat sensitif;
-   admin dashboard harus diperlakukan sebagai MVP/internal
    authentication.

Jika project nantinya memiliki backend, face verification harus
dipindahkan atau ditambah server-side verification.

------------------------------------------------------------------------

# 5. Recommended Architecture

``` text
src/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── setup-face/
│   │   │   └── page.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   │
│   └── ...
│
├── components/
│   ├── face-auth/
│   │   ├── FaceCamera.tsx
│   │   ├── FaceDetector.tsx
│   │   ├── LivenessChallenge.tsx
│   │   ├── FaceEnrollment.tsx
│   │   ├── FaceRecognition.tsx
│   │   ├── FaceVerification.tsx
│   │   └── FaceAuthGuard.tsx
│   │
│   └── admin/
│       ├── AdminLayout.tsx
│       └── ...
│
├── lib/
│   ├── face/
│   │   ├── detector.ts
│   │   ├── liveness.ts
│   │   ├── recognition.ts
│   │   ├── embedding.ts
│   │   ├── similarity.ts
│   │   └── model-loader.ts
│   │
│   ├── auth/
│   │   ├── admin-auth.ts
│   │   └── admin-storage.ts
│   │
│   └── crypto/
│       └── ...
│
├── data/
│   └── admin.ts
│
└── types/
    └── face-auth.ts
```

Jangan membuat satu file besar untuk seluruh face authentication.

------------------------------------------------------------------------

# 6. Routes

Minimum:

``` text
/admin/login
/admin/setup-face
/admin/dashboard
```

Flow:

``` text
/admin/login
      ↓
Password verification
      ↓
Face verification
      ↓
/admin/dashboard
```

Enrollment:

``` text
/admin/setup-face
      ↓
Admin authentication
      ↓
Camera
      ↓
Capture multiple samples
      ↓
Generate embeddings
      ↓
Save local face profile
```

------------------------------------------------------------------------

# 7. Recommended Libraries

AI coding agent harus mengecek kompatibilitas versi package sebelum
implementasi.

Prioritas library:

## Face detection / landmarks / recognition

Gunakan library browser-compatible yang aktif dan kompatibel dengan
Next.js.

Pilihan utama:

``` text
@vladmandic/face-api
```

Jika package/version tersebut tidak kompatibel dengan project saat
implementasi, evaluasi alternatif browser-side seperti TensorFlow.js
atau MediaPipe.

Jangan memasukkan library hanya karena populer.

Pastikan:

-   browser compatible;
-   TypeScript compatible;
-   tidak membutuhkan Node runtime saat runtime;
-   model dapat diload dari `/public`;
-   kompatibel dengan static export.

------------------------------------------------------------------------

# 8. Model Loading

Model AI tidak boleh di-load pada SSR.

Semua model harus dimuat hanya di client.

Gunakan pola:

``` tsx
'use client';
```

dan lazy/dynamic import bila diperlukan.

Model sebaiknya ditempatkan:

``` text
public/
└── models/
    ├── ...
```

Jangan mengandalkan URL eksternal untuk model saat production jika tidak
diperlukan.

Target:

``` text
/models/<model-files>
```

Gunakan satu model version yang konsisten.

------------------------------------------------------------------------

# 9. Face Detection

Face Detection bertugas memastikan kamera menangkap wajah.

Detection harus menghasilkan informasi seperti:

``` ts
interface FaceDetectionResult {
  detected: boolean;
  box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence?: number;
  landmarks?: unknown;
}
```

Minimal validasi:

1.  tepat satu wajah;
2.  wajah cukup besar;
3.  wajah berada dalam area kamera;
4.  confidence cukup tinggi;
5.  wajah tidak terlalu keluar frame.

Jika:

``` text
0 wajah
```

tampilkan:

> Wajah belum terdeteksi.

Jika:

``` text
> 1 wajah
```

tampilkan:

> Pastikan hanya satu wajah berada di depan kamera.

Jangan lanjut ke recognition jika detection belum valid.

------------------------------------------------------------------------

# 10. Camera Handling

Gunakan:

``` js
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'user',
    width: { ideal: 640 },
    height: { ideal: 480 }
  },
  audio: false
});
```

Jangan meminta microphone.

Saat component unmount:

-   stop seluruh video tracks;
-   clear stream;
-   release camera.

Contoh konsep:

``` ts
stream.getTracks().forEach(track => track.stop());
```

Jangan meninggalkan kamera aktif setelah user meninggalkan halaman.

------------------------------------------------------------------------

# 11. Camera UX

UI kamera harus memberikan feedback realtime.

State:

``` text
initializing
camera-request
detecting
face-detected
liveness
recognizing
success
error
```

Contoh:

``` text
Mengaktifkan kamera...
```

kemudian:

``` text
Posisikan wajah di dalam frame.
```

kemudian:

``` text
Wajah terdeteksi.
```

kemudian:

``` text
Silakan kedip.
```

kemudian:

``` text
Memverifikasi identitas...
```

------------------------------------------------------------------------

# 12. Liveness Detection

Liveness wajib dilakukan sebelum recognition.

Tujuan:

``` text
Membedakan manusia hidup dengan foto/screenshot sederhana.
```

Untuk MVP gunakan active challenge-response.

Contoh challenge:

``` text
BLINK
TURN_LEFT
TURN_RIGHT
```

Flow:

``` text
Face Detection
      ↓
Generate random challenge
      ↓
Challenge #1
      ↓
Pass?
      ↓
Challenge #2
      ↓
Pass?
      ↓
Challenge #3
      ↓
Liveness Verified
```

Jangan selalu menggunakan urutan challenge yang sama.

------------------------------------------------------------------------

# 13. Liveness Challenge

Contoh UI:

``` text
VERIFIKASI WAJAH

Ikuti instruksi:

● Kedipkan mata

Progress:
● ○ ○
```

Kemudian:

``` text
Sekarang hadapkan wajah sedikit ke kanan.
```

Kemudian:

``` text
Sekarang kembali menghadap kamera.
```

Gunakan face landmarks/head pose bila tersedia.

Jangan menganggap liveness berhasil hanya karena wajah terdeteksi.

------------------------------------------------------------------------

# 14. Blink Detection

Jika menggunakan eye landmarks:

Gunakan konsep Eye Aspect Ratio (EAR) atau metode setara.

Deteksi transisi:

``` text
eye open
    ↓
eye closed
    ↓
eye open
```

Jangan menganggap mata tertutup terus-menerus sebagai blink.

Gunakan beberapa frame berturut-turut untuk mengurangi false positive.

------------------------------------------------------------------------

# 15. Head Turn Detection

Gunakan landmark/head pose.

Contoh:

``` text
yaw < threshold
```

untuk kiri/kanan sesuai koordinat library yang digunakan.

Jangan hardcode asumsi arah tanpa menguji koordinat model.

Untuk MVP, threshold harus configurable.

Contoh:

``` ts
const LIVENESS_CONFIG = {
  blinkFrames: 2,
  headTurnThreshold: 15,
  challengeTimeoutMs: 8000,
  maxAttempts: 3,
};
```

Nilai tersebut hanya baseline dan harus diuji pada perangkat nyata.

------------------------------------------------------------------------

# 16. Anti-Spoofing Limitation

Active liveness sederhana bukan anti-spoofing sempurna.

Ia membantu menghadapi:

-   foto statis;
-   screenshot;
-   sebagian serangan replay sederhana.

Namun tidak menjamin perlindungan terhadap:

-   video replay;
-   deepfake;
-   sophisticated presentation attacks.

Jangan menulis klaim:

> "100% anti spoofing."

Gunakan istilah:

> "Liveness verification for basic presentation-attack resistance."

------------------------------------------------------------------------

# 17. Face Recognition

Setelah liveness sukses:

``` text
Face
 ↓
Embedding
 ↓
Compare
 ↓
Match / Reject
```

Jangan melakukan recognition sebelum liveness selesai.

------------------------------------------------------------------------

# 18. Face Enrollment

Admin harus melakukan enrollment terlebih dahulu.

Route:

``` text
/admin/setup-face
```

Minimal ambil:

``` text
5–10 samples
```

dengan variasi:

-   wajah lurus;
-   sedikit kiri;
-   sedikit kanan;
-   ekspresi netral;
-   kondisi pencahayaan berbeda.

Jangan menyimpan semua frame kamera.

Ambil hanya embedding yang lolos quality check.

------------------------------------------------------------------------

# 19. Enrollment Quality

Setiap sample harus divalidasi:

``` text
exactly one face
+
good confidence
+
reasonable face size
+
reasonable pose
```

Jika gagal:

> Foto wajah belum cukup jelas. Posisikan wajah lebih dekat dan pastikan
> pencahayaan cukup.

Jangan menyimpan sample yang buruk.

------------------------------------------------------------------------

# 20. Face Profile Data Model

Gunakan TypeScript types.

Contoh:

``` ts
interface FaceProfile {
  version: number;
  modelVersion: string;
  embeddings: number[][];
  createdAt: string;
  updatedAt: string;
}
```

Contoh storage:

``` text
FaceProfile
├── version
├── modelVersion
├── embeddings
├── createdAt
└── updatedAt
```

Jangan menyimpan image blob sebagai credential jika embedding sudah
cukup.

------------------------------------------------------------------------

# 21. Multiple Embeddings

Satu admin dapat mempunyai beberapa embedding.

Saat login:

``` text
Live Embedding
      ↓
Compare against embedding #1
Compare against embedding #2
Compare against embedding #3
...
      ↓
Best similarity
```

Gunakan nilai terbaik atau strategi agregasi yang jelas.

Jangan hanya membandingkan dengan satu sample.

------------------------------------------------------------------------

# 22. Similarity Metric

Gunakan metric yang sesuai dengan model.

Jika model menghasilkan embedding yang cocok untuk Euclidean distance:

``` text
distance = euclidean(a, b)
```

Jika cocok untuk cosine similarity:

``` text
similarity =
dot(a, b) /
(norm(a) * norm(b))
```

Jangan mencampur threshold dari model/library lain.

Threshold harus berasal dari model yang digunakan dan hasil pengujian.

Contoh config:

``` ts
const FACE_MATCH_CONFIG = {
  threshold: 0.6,
};
```

Nilai `0.6` adalah placeholder dan WAJIB dikalibrasi.

Jangan menganggap 0.6 sebagai universal.

------------------------------------------------------------------------

# 23. Threshold Calibration

AI coding agent harus menyediakan konfigurasi terpusat:

``` ts
const FACE_AUTH_CONFIG = {
  recognitionThreshold: ...,
  livenessTimeoutMs: ...,
  maxAttempts: 3,
};
```

Threshold harus diuji menggunakan:

-   genuine attempts;
-   impostor attempts;
-   kamera HP;
-   webcam laptop;
-   pencahayaan berbeda;
-   kacamata;
-   sedikit perubahan sudut.

Tujuannya menemukan trade-off:

``` text
False Accept Rate
vs
False Reject Rate
```

Untuk admin, false accept harus diprioritaskan untuk diminimalkan.

------------------------------------------------------------------------

# 24. Authentication State

Untuk MVP static export, gunakan client-side session.

Jangan menyimpan password plaintext.

Jangan menganggap client-side state sebagai secure authentication.

Contoh:

``` ts
interface AdminSession {
  adminId: string;
  authenticatedAt: string;
  method: 'password+face';
  expiresAt: string;
}
```

Session dapat menggunakan in-memory state + sessionStorage/IndexedDB
sesuai kebutuhan UX.

Untuk sensitive admin actions, tambahkan re-authentication.

------------------------------------------------------------------------

# 25. Admin Credentials

Jika tidak ada backend/database:

Jangan membuat hardcoded plaintext password seperti:

``` ts
password: 'admin123'
```

Jika demo credential memang diperlukan, buat konfigurasi
development-only dan beri peringatan.

Untuk deployment production, gunakan authentication mechanism yang
memiliki trusted server boundary atau WebAuthn.

Face profile lokal juga bukan trusted database.

------------------------------------------------------------------------

# 26. IndexedDB

Jika membutuhkan persistent local face profile, gunakan IndexedDB
daripada localStorage untuk data embedding.

Buat abstraction:

``` text
lib/auth/admin-storage.ts
```

API:

``` ts
saveFaceProfile(profile)
getFaceProfile()
deleteFaceProfile()
hasFaceProfile()
```

Jangan akses IndexedDB langsung dari banyak component.

Satu abstraction layer harus menjadi sumber akses.

------------------------------------------------------------------------

# 27. Privacy

UI harus menjelaskan:

> Foto kamu diproses langsung di perangkat dan tidak diunggah ke server.

Jika hanya embedding yang disimpan:

> Sistem menyimpan representasi numerik wajah untuk proses verifikasi
> lokal.

Tetap perlakukan embedding sebagai data biometrik sensitif.

Jangan:

-   log embedding ke console;
-   mengirim embedding ke analytics;
-   memasukkannya ke error tracking;
-   menyimpan foto kamera tanpa kebutuhan;
-   mengirim frame kamera ke pihak ketiga tanpa persetujuan.

------------------------------------------------------------------------

# 28. Cleanup

Saat camera component ditutup:

``` text
stop video tracks
clear video source
cancel animation loops
remove timers
remove event listeners
```

Saat recognition selesai:

``` text
stop camera
```

Jangan biarkan kamera aktif setelah authentication sukses.

------------------------------------------------------------------------

# 29. Performance

Face processing realtime cukup berat.

Jangan menjalankan inference pada setiap JavaScript tick.

Gunakan throttling.

Contoh konsep:

``` text
Camera: 30 FPS
AI inference: 5–10 FPS
```

Sesuaikan dengan perangkat.

Gunakan:

``` text
requestAnimationFrame
```

atau interval terkontrol.

Jangan melakukan inference terlalu sering pada HP low-end.

------------------------------------------------------------------------

# 30. Model Loading UX

Model AI dapat berukuran besar.

Tampilkan:

``` text
Menyiapkan verifikasi wajah...
```

dan progress bila memungkinkan.

Jangan membuat halaman terlihat stuck.

Model harus di-cache browser jika memungkinkan.

------------------------------------------------------------------------

# 31. Mobile Compatibility

Target utama:

``` text
Android Chrome
iOS Safari
Desktop Chrome
Desktop Edge
```

Pastikan:

-   camera permission jelas;
-   HTTPS digunakan;
-   video tidak keluar viewport;
-   portrait orientation nyaman;
-   touch UI;
-   tombol minimum 44px;
-   tidak ada horizontal overflow.

Camera API membutuhkan secure context.

Production harus menggunakan:

``` text
https://
```

------------------------------------------------------------------------

# 32. Mantine UI

Gunakan Mantine sebagai UI component library.

Komponen yang dapat digunakan:

-   Paper
-   Button
-   Text
-   Title
-   Badge
-   Progress
-   Alert
-   Modal
-   Drawer
-   Notification
-   Loader
-   Stack
-   Group
-   Center
-   Slider

Jangan membuat UI terlihat seperti default Mantine.

Gunakan styling IWU:

``` text
Navy
Purple
Gold
Off-white
```

Visual harus:

``` text
Academic
Elegant
Modern
Minimal
Human
```

Hindari AI slop:

-   excessive gradients;
-   excessive glassmorphism;
-   oversized cards;
-   rounded-everything;
-   floating blobs;
-   excessive animations.

------------------------------------------------------------------------

# 33. Face Camera UI

Rekomendasi:

``` text
┌─────────────────────────────┐
│                             │
│       Camera Preview        │
│                             │
│       ┌───────────┐         │
│       │           │         │
│       │     🙂    │         │
│       │           │         │
│       └───────────┘         │
│                             │
│  Posisikan wajah di frame   │
│                             │
└─────────────────────────────┘
```

Tambahkan status:

``` text
Detecting...
Liveness...
Recognizing...
```

Jangan menutupi wajah dengan terlalu banyak overlay.

------------------------------------------------------------------------

# 34. Login Flow

Exact flow:

``` text
/admin/login
       ↓
Enter admin identity
       ↓
Password verification
       ↓
Check face profile exists
       ↓
Open camera
       ↓
Face detection
       ↓
Liveness challenge
       ↓
Generate embedding
       ↓
Compare with enrolled embeddings
       ↓
Similarity threshold
       ↓
Success / Reject
```

Jika password gagal:

``` text
Stop.
```

Jangan membuka face verification.

Jika tidak ada face profile:

``` text
Face authentication belum diaktifkan.
```

Berikan link ke enrollment/setup yang hanya tersedia setelah admin
melewati primary authentication.

------------------------------------------------------------------------

# 35. Retry Policy

Jangan melakukan infinite retry.

Contoh:

``` text
Maximum attempts = 3
```

Setelah gagal:

``` text
Verifikasi gagal.

Silakan coba lagi atau gunakan metode login alternatif.
```

Tambahkan cooldown bila diperlukan.

------------------------------------------------------------------------

# 36. Failure States

Handle:

### Camera denied

> Akses kamera diperlukan untuk verifikasi wajah.

### Camera unavailable

> Kamera tidak tersedia pada perangkat ini.

### No face

> Wajah belum terdeteksi.

### Multiple faces

> Pastikan hanya satu orang berada di depan kamera.

### Liveness failed

> Verifikasi kehadiran gagal. Silakan coba lagi.

### Recognition failed

> Wajah tidak cocok dengan akun admin.

### Model failed

> Modul verifikasi wajah gagal dimuat. Silakan refresh halaman.

### Browser unsupported

> Browser ini belum mendukung verifikasi wajah.

Jangan gunakan `alert()`.

Gunakan Mantine Alert/Notification.

------------------------------------------------------------------------

# 37. Face Auth Guard

Buat:

``` text
FaceAuthGuard.tsx
```

Tujuan:

``` text
/admin/dashboard
```

tidak dapat dibuka dari UI tanpa session.

Pseudo-flow:

``` ts
if (!session) {
  redirectToLogin();
}
```

Namun ingat:

> Client-side route guard hanya UX protection, bukan server-side
> security.

Jangan menyatakan bahwa route guard membuat dashboard benar-benar aman
dari user yang memodifikasi client.

------------------------------------------------------------------------

# 38. Session Expiration

Gunakan expiration.

Contoh:

``` text
Session lifetime:
30 minutes
```

Setelah expired:

``` text
Session expired.
Please verify again.
```

Untuk operasi sangat sensitif, minta face verification ulang.

------------------------------------------------------------------------

# 39. Re-authentication

Tambahkan fungsi:

``` text
requireFaceReauthentication()
```

untuk operasi sensitif seperti:

-   mengubah konfigurasi;
-   menghapus data;
-   mengelola admin;
-   mengubah frame;
-   mengubah informasi penting PKKMB.

Untuk MVP dapat berupa modal face verification.

------------------------------------------------------------------------

# 40. Do Not Store Raw Camera Frames

Jangan melakukan:

``` text
video frame
 ↓
base64
 ↓
localStorage
```

Jangan.

Gunakan frame hanya di memory untuk inference.

Setelah selesai, buang.

------------------------------------------------------------------------

# 41. Do Not Log Sensitive Data

Jangan:

``` ts
console.log(faceEmbedding);
console.log(cameraFrame);
console.log(faceProfile);
```

Production code harus bebas dari logging biometrik.

------------------------------------------------------------------------

# 42. Accessibility

Camera verification tetap harus memiliki:

-   readable instruction;
-   keyboard accessible controls;
-   clear status;
-   sufficient contrast;
-   non-color-only feedback.

Jangan mengandalkan hanya:

``` text
green = success
red = fail
```

Gunakan icon + text.

------------------------------------------------------------------------

# 43. Testing Requirements

Minimal test scenarios:

## Detection

-   no face;
-   one face;
-   multiple faces;
-   face too far;
-   face too close.

## Liveness

-   valid blink;
-   invalid blink;
-   valid left/right movement;
-   timeout;
-   multiple faces.

## Recognition

-   correct admin;
-   wrong person;
-   low confidence;
-   different lighting;
-   glasses;
-   different angle.

## Authentication

-   wrong password;
-   correct password + wrong face;
-   correct password + correct face;
-   expired session;
-   no face profile.

------------------------------------------------------------------------

# 44. Development Mode

Tambahkan development diagnostics yang hanya aktif jika:

``` ts
process.env.NODE_ENV === 'development'
```

Contoh:

``` text
Face detected
Confidence
Liveness state
Similarity score
```

Tetapi jangan expose embedding mentah.

Production tidak boleh menampilkan similarity score detail jika tidak
diperlukan.

------------------------------------------------------------------------

# 45. Feature Flags

Buat konfigurasi:

``` ts
const FACE_AUTH_ENABLED = true;
```

atau environment/config equivalent.

Tujuannya agar fitur dapat dinonaktifkan tanpa menghapus implementasi.

Jika static export membutuhkan environment variable, ingat bahwa
`NEXT_PUBLIC_*` dapat terlihat oleh browser.

Jangan pernah menaruh secret di `NEXT_PUBLIC_*`.

------------------------------------------------------------------------

# 46. Static Export Compatibility

Fitur harus kompatibel dengan:

``` js
output: 'export'
```

Jangan menggunakan:

-   API routes;
-   server actions;
-   Node-only packages;
-   filesystem access;
-   server runtime;
-   dynamic server authentication;
-   secret backend credentials.

Semua face processing harus berjalan di browser.

------------------------------------------------------------------------

# 47. Build Requirements

Harus berhasil:

``` bash
npm run build
```

Output:

``` text
out/
```

Tidak boleh ada:

-   hydration error;
-   SSR error dari `window`;
-   SSR error dari `navigator`;
-   SSR error dari camera API;
-   model loading error karena path salah.

------------------------------------------------------------------------

# 48. SSR Safety

Semua penggunaan:

``` text
window
navigator
document
indexedDB
MediaDevices
HTMLVideoElement
HTMLCanvasElement
```

harus hanya terjadi di client runtime.

Gunakan:

``` tsx
'use client';
```

dan `useEffect`/dynamic import sesuai kebutuhan.

Jangan menjalankan:

``` ts
navigator.mediaDevices
```

pada module top-level.

------------------------------------------------------------------------

# 49. Model Asset Paths

Gunakan path public yang konsisten.

Contoh:

``` text
public/models/face/
```

Runtime:

``` text
/models/face/
```

Jangan menggunakan path filesystem:

``` text
./public/models
```

di browser.

------------------------------------------------------------------------

# 50. No External Upload

Face verification tidak boleh meng-upload foto ke:

-   Cloudinary;
-   S3;
-   Firebase Storage;
-   server custom;
-   analytics endpoint.

Kecuali arsitektur berubah secara eksplisit dan user diberi informasi.

------------------------------------------------------------------------

# 51. Recommended Component State Machine

Face verification sebaiknya menggunakan state machine sederhana:

``` ts
type FaceAuthState =
  | 'idle'
  | 'loading-models'
  | 'requesting-camera'
  | 'detecting'
  | 'liveness'
  | 'recognizing'
  | 'success'
  | 'failed';
```

Jangan menggunakan banyak boolean yang dapat menghasilkan state invalid
seperti:

``` ts
isLoading
isCamera
isDetecting
isLiveness
isRecognizing
isSuccess
isError
```

jika semuanya dapat aktif bersamaan.

Gunakan satu primary state.

------------------------------------------------------------------------

# 52. Recognition Pipeline Pseudocode

``` ts
async function verifyAdminFace() {
  await loadModels();

  const stream = await openCamera();

  try {
    const detection = await detectFace(stream);

    if (!detection.valid) {
      throw new FaceDetectionError();
    }

    const livenessResult = await runLivenessChallenge(stream);

    if (!livenessResult.success) {
      throw new LivenessError();
    }

    const embedding = await createEmbedding(stream);

    const profile = await getFaceProfile();

    if (!profile) {
      throw new FaceProfileNotFoundError();
    }

    const result = compareEmbedding(
      embedding,
      profile.embeddings
    );

    if (!result.matched) {
      throw new FaceMismatchError();
    }

    return authenticateAdmin();
  } finally {
    stopCamera(stream);
  }
}
```

Ini hanya conceptual architecture. Sesuaikan dengan API library yang
benar-benar digunakan.

------------------------------------------------------------------------

# 53. Enrollment Pseudocode

``` ts
async function enrollAdminFace() {
  await loadModels();

  const stream = await openCamera();

  try {
    const embeddings = [];

    while (embeddings.length < REQUIRED_SAMPLES) {
      const detection = await detectFace(stream);

      if (!detection.valid) {
        continue;
      }

      const quality = evaluateFaceQuality(detection);

      if (!quality.valid) {
        continue;
      }

      const embedding = await createEmbedding(stream);

      embeddings.push(embedding);
    }

    const profile = {
      version: 1,
      modelVersion: CURRENT_MODEL_VERSION,
      embeddings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveFaceProfile(profile);
  } finally {
    stopCamera(stream);
  }
}
```

------------------------------------------------------------------------

# 54. Model Versioning

Face embeddings bergantung pada model.

Karena itu simpan:

``` ts
modelVersion
```

Contoh:

``` text
face-model-v1
```

Jika model berubah:

``` text
face-model-v2
```

embedding lama mungkin harus di-enroll ulang.

Jangan membandingkan embedding dari model berbeda tanpa validasi
kompatibilitas.

------------------------------------------------------------------------

# 55. Storage Versioning

Gunakan schema version.

Contoh:

``` ts
{
  version: 1,
  modelVersion: 'face-model-v1',
  ...
}
```

Jika struktur berubah:

``` text
version 2
```

Buat migration/clear profile yang jelas.

------------------------------------------------------------------------

# 56. Admin Setup Security

Enrollment wajah tidak boleh bisa dilakukan anonymous.

Flow:

``` text
/admin/setup-face
        ↓
Primary authentication
        ↓
Enrollment
```

Jangan:

``` text
Visit /admin/setup-face
↓
Scan face
↓
Become admin
```

Itu merupakan authentication bypass.

------------------------------------------------------------------------

# 57. Multiple Admin

Jika aplikasi nantinya memiliki banyak admin:

``` ts
interface AdminFaceProfile {
  adminId: string;
  embeddings: number[][];
}
```

Saat login:

``` text
User chooses admin account
        ↓
Compare only against that user's embeddings
```

Lebih aman daripada mencari kecocokan ke seluruh database jika identity
sudah diketahui.

------------------------------------------------------------------------

# 58. Do Not Implement 1:N Recognition Unless Needed

Jika login sudah meminta:

``` text
email / username
```

gunakan:

``` text
1:1 verification
```

bukan:

``` text
1:N identification
```

1:1:

``` text
"Apakah wajah ini milik Abdanio?"
```

1:N:

``` text
"Siapa orang ini dari seluruh database?"
```

Untuk authentication, 1:1 lebih sederhana dan lebih tepat.

------------------------------------------------------------------------

# 59. UX Copy

Gunakan bahasa Indonesia.

Primary:

> Verifikasi Wajah

Instruction:

> Posisikan wajah kamu di dalam frame.

Liveness:

> Ikuti instruksi di layar.

Recognition:

> Memverifikasi identitas...

Success:

> Identitas berhasil diverifikasi.

Failure:

> Wajah tidak cocok dengan akun ini.

Privacy:

> Kamera diproses langsung di perangkat. Foto tidak diunggah ke server.

Hindari copy yang terlalu teknis untuk user.

------------------------------------------------------------------------

# 60. Visual Direction

Face authentication harus terasa sebagai bagian dari IWU.

Gunakan:

``` text
Deep Navy #0A192F
Navy #0F2042
Purple #7C3AED
Gold #D4AF37
Off-white #F8FAFC
```

Jangan membuat:

-   neon cyberpunk;
-   futuristic AI HUD;
-   glowing face scanner;
-   excessive purple gradient;
-   sci-fi dashboard.

Visual:

``` text
Modern university
+
Elegant
+
Trustworthy
+
Minimal
```

Scanner overlay boleh sangat subtle.

------------------------------------------------------------------------

# 61. Recommended Login Layout

Desktop:

``` text
┌──────────────────────────────────────────┐
│                                          │
│   IWU ADMIN                 VERIFIKASI   │
│                              WAJAH       │
│                                          │
│   Account                  ┌─────────┐  │
│   Password                 │         │  │
│                            │ CAMERA  │  │
│   [ Login ]                │    🙂   │  │
│                            │         │  │
│                            └─────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

Mobile:

``` text
IWU ADMIN

Verifikasi identitas

┌───────────────────┐
│                   │
│      CAMERA       │
│        🙂         │
│                   │
└───────────────────┘

Ikuti instruksi di layar

[ Verifikasi ]
```

Jangan membuat login terlihat seperti dashboard.

------------------------------------------------------------------------

# 62. Acceptance Criteria

Feature dianggap selesai jika:

-   [ ] Admin dapat membuka `/admin/login`.
-   [ ] Camera permission ditangani.
-   [ ] Camera dapat dimulai dan dihentikan.
-   [ ] Face detection bekerja.
-   [ ] Multiple-face condition ditangani.
-   [ ] Liveness challenge bekerja.
-   [ ] Face enrollment dapat membuat beberapa embeddings.
-   [ ] Embeddings tersimpan melalui abstraction storage.
-   [ ] Recognition membandingkan live embedding dengan enrolled
    embeddings.
-   [ ] Threshold dapat dikonfigurasi.
-   [ ] Correct face dapat lolos.
-   [ ] Wrong face ditolak.
-   [ ] Session dapat dibuat setelah verifikasi sukses.
-   [ ] Session memiliki expiry.
-   [ ] Camera dimatikan setelah selesai.
-   [ ] Tidak ada raw image yang disimpan.
-   [ ] Tidak ada biometric data yang di-log.
-   [ ] Mobile Chrome berfungsi.
-   [ ] Desktop Chrome/Edge berfungsi.
-   [ ] Static export berhasil.
-   [ ] Tidak ada SSR/hydration error.
-   [ ] UI menggunakan Mantine.
-   [ ] UI mengikuti visual identity IWU.
-   [ ] Error states tersedia.
-   [ ] Loading states tersedia.
-   [ ] Accessibility dasar terpenuhi.

------------------------------------------------------------------------

# 63. Definition of Done

AI coding agent WAJIB:

1.  Memeriksa package/version project yang sudah ada sebelum mengubah
    dependency.
2.  Tidak mengganti stack project yang sudah ada.
3.  Tidak membuat Laravel.
4.  Tidak membuat backend baru.
5.  Tidak menghapus fitur Twibbon yang sudah ada.
6.  Membuat face-auth sebagai module terisolasi.
7.  Memastikan browser-only API aman dari SSR.
8.  Menggunakan model lokal dari `/public/models`.
9.  Menambahkan loading/error states.
10. Menghentikan camera stream dengan benar.
11. Tidak menyimpan raw face images.
12. Tidak log embedding.
13. Menjelaskan keterbatasan client-side authentication.
14. Menjalankan `npm run build`.
15. Memperbaiki seluruh error build sebelum menyatakan selesai.

------------------------------------------------------------------------

# 64. Future Upgrade Path

Arsitektur harus memungkinkan migrasi ke security yang lebih kuat.

Roadmap:

``` text
CURRENT
Next.js
+
Face Detection
+
Liveness
+
Face Recognition
+
IndexedDB
+
Client Session

        ↓

PHASE 2

Next.js
+
WebAuthn / Passkey
+
Face verification as additional factor

        ↓

PHASE 3

Next.js
+
Trusted Backend
+
Server-side Authentication
+
Server-side Face Verification
+
Audit Log
```

Jangan membuat arsitektur saat ini terlalu tightly coupled sehingga
migrasi menjadi sulit.

------------------------------------------------------------------------

# 65. Important Final Instruction to AI Coding Agent

Sebelum coding:

1.  Inspect existing project structure.
2.  Inspect existing `package.json`.
3.  Inspect Next.js version.
4.  Inspect Mantine version.
5.  Inspect TypeScript configuration.
6.  Inspect Tailwind configuration.
7.  Inspect `next.config`.
8.  Inspect existing authentication.
9.  Inspect existing `/admin` routes.
10. Reuse existing architecture whenever possible.

Jangan langsung membuat ulang project.

Jangan mengasumsikan versi package.

Setelah inspection, implementasikan feature secara incremental.

Prioritas:

``` text
Correctness
    ↓
Security awareness
    ↓
Privacy
    ↓
UX
    ↓
Performance
    ↓
Visual polish
```

Feature utama:

``` text
FACE DETECTION
      ↓
LIVENESS DETECTION
      ↓
FACE RECOGNITION
      ↓
AUTHENTICATION
```

Bukan sekadar animasi "AI face scanner".

Implementasikan fitur yang benar-benar melakukan computer vision
inference, liveness challenge, embedding comparison, dan authentication
state management.

------------------------------------------------------------------------

# 66. Final Security Note

Implementasi ini adalah **client-side face authentication MVP**.

Jangan mengklaim:

> "Tidak bisa dibobol."

Jangan mengklaim:

> "100% secure."

Jangan mengklaim:

> "100% anti-spoofing."

Dokumentasikan bahwa browser/client yang dikendalikan user tidak dapat
menjadi trusted security boundary.

Jika admin dashboard akan mengelola data yang sangat sensitif atau
memiliki destructive operations, gunakan:

``` text
WebAuthn / Passkey
+
server-side authentication
```

sebagai security boundary utama.

Face recognition dapat tetap digunakan sebagai UX/security layer
tambahan.
