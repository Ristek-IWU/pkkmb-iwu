# AI CODING PROMPT
## PKKMB International Women University — Twibbon & New Student Portal

Kamu adalah **Senior Frontend Engineer + Product Designer** yang berpengalaman membangun web application modern menggunakan Next.js, TypeScript, Mantine UI, Tailwind CSS, dan Fabric.js.

Bangun sebuah website **PKKMB International Women University (IWU)** yang berfungsi sebagai portal digital mahasiswa baru, dengan fitur utama **Twibbon Studio** untuk membuat foto profil PKKMB secara langsung di browser.

Website harus terasa seperti produk digital kampus yang benar-benar dirancang oleh designer profesional — **bukan template AI, bukan landing page SaaS generik, dan bukan kumpulan card yang berlebihan**.

---

# 1. PRODUCT VISION

Nama produk:

**PKKMB IWU — New Student Experience**

Primary headline:

> Welcome, Future Leaders.

Supporting text:

> Rayakan langkah pertama kamu bersama International Women University.

Website ditujukan terutama untuk:

- Mahasiswa baru IWU
- Pengunjung mobile
- Peserta PKKMB
- Panitia PKKMB
- Civitas akademika

Tujuan utama:

1. Membantu Maba membuat Twibbon PKKMB.
2. Memberikan informasi jadwal dan panduan PKKMB.
3. Memberikan informasi kelompok peserta.
4. Membantu Maba membuat caption Instagram secara otomatis.
5. Memberikan pengalaman digital yang merepresentasikan IWU sebagai kampus modern dan berorientasi global.

---

# 2. CORE TECH STACK

Gunakan:

- Next.js terbaru
- App Router
- TypeScript
- React
- Tailwind CSS
- Mantine UI
- Fabric.js
- Lucide React / Tabler Icons
- next/font/google
- Browser APIs untuk image processing
- Static Export

Jangan menggunakan:

- Bootstrap
- Material UI
- Chakra UI
- shadcn/ui sebagai komponen utama
- jQuery
- server-side image processing
- database untuk fitur Twibbon
- API backend yang tidak diperlukan

Mantine digunakan sebagai **primary component library**.

Tailwind digunakan untuk:

- layout
- responsive utilities
- spacing
- custom styling
- page composition

Gunakan Mantine untuk:

- Button
- Tabs
- Modal
- Drawer
- TextInput
- Select
- FileInput
- Badge
- Paper
- Card
- Tooltip
- Notification
- SegmentedControl
- Accordion
- Progress
- Loading states

---

# 3. DESIGN DIRECTION

## Hindari AI Slop

Jangan membuat desain yang terlihat seperti:

- SaaS template generik
- dashboard dengan 20 card
- gradient ungu-biru berlebihan
- glassmorphism di setiap komponen
- rounded-3xl pada semua elemen
- shadow besar pada setiap card
- terlalu banyak floating blobs
- terlalu banyak gradient
- hero section yang terlalu tinggi
- icon dalam lingkaran di setiap section
- teks marketing yang terlalu generik
- layout yang terasa seperti hasil generator AI

Jangan membuat semua elemen berbentuk kartu.

Gunakan **flat hierarchy**, whitespace yang cukup, typography yang kuat, dan komposisi editorial.

Visual harus terasa seperti:

**modern university digital platform + youth culture + editorial design**

bukan:

**startup SaaS landing page.**

---

# 4. IWU VISUAL IDENTITY

Gunakan visual identity yang terinspirasi dari institusi pendidikan modern.

### Primary

Deep Royal Navy:

`#0A192F`

Secondary Navy:

`#0F2042`

### Accent

Elegance Purple:

`#7C3AED`

Soft Purple:

`#9333EA`

Warm Gold:

`#D4AF37`

### Neutral

Background:

`#F8FAFC`

Surface:

`#FFFFFF`

Text:

`#0F172A`

Muted:

`#64748B`

Border:

`#E2E8F0`

Gunakan navy sebagai warna utama.

Purple dan gold hanya sebagai accent.

Jangan menggunakan purple sebagai warna dominan di seluruh halaman.

---

# 5. TYPOGRAPHY

Gunakan:

**Plus Jakarta Sans**

melalui:

`next/font/google`

Hierarchy:

- Display: bold / semibold
- Heading: semibold
- Body: regular
- Caption: medium

Typography harus memiliki hierarchy yang jelas.

Jangan menggunakan font-size besar secara berlebihan.

Headline maksimal sekitar:

`clamp(2.5rem, 8vw, 5.5rem)`

sesuaikan dengan viewport.

---

# 6. INFORMATION ARCHITECTURE

Website terdiri dari tiga fitur utama:

### Studio

Twibbon creator.

### Agenda

Jadwal dan panduan PKKMB.

### Kelompok

Informasi kelompok peserta.

Gunakan navigasi utama:

```text
Home
Studio
Agenda
Kelompok
```

Pada mobile, navigasi dapat menggunakan:

**Mantine Tabs / bottom navigation style**

Tetapi jangan membuat bottom navigation jika tidak benar-benar dibutuhkan.

---

# 7. HOMEPAGE

Homepage harus minimal dan fokus.

## Hero

Gunakan layout editorial.

Contoh:

Small eyebrow:

`PKKMB 2026`

Headline:

> Welcome, Future Leaders.

Description:

> Mulai perjalananmu di International Women University dan abadikan momen pertama sebagai bagian dari keluarga IWU.

CTA utama:

`Buat Twibbon`

CTA sekunder:

`Lihat Agenda`

Tambahkan informasi kecil:

`International Women University · Bandung`

Jangan membuat hero terlalu penuh.

Tidak perlu:

- floating shapes
- animated blobs
- gradient mesh
- excessive glassmorphism

Jika menggunakan image, gunakan satu visual utama yang relevan dengan mahasiswa baru/IWU.

---

# 8. TWIBBON STUDIO

Ini adalah fitur terpenting.

Route:

```text
/studio
```

Buat halaman yang fokus pada workflow.

Desktop:

```text
┌──────────────────────────────┬──────────────────────┐
│                              │                      │
│       CANVAS PREVIEW         │      CONTROLS        │
│                              │                      │
│                              │ Upload Foto          │
│                              │ Pilih Frame          │
│                              │ Position             │
│                              │ Zoom                 │
│                              │ Rotate               │
│                              │                      │
│                              │ Download             │
└──────────────────────────────┴──────────────────────┘
```

Mobile:

```text
Canvas

Upload Foto

Frame

Position

Zoom

Rotate

Download
```

Canvas harus menjadi fokus utama.

---

# 9. FABRIC.JS

Fabric.js hanya boleh dijalankan di client.

Gunakan:

```tsx
'use client'
```

Jangan menginisialisasi Fabric.js pada server.

Gunakan dynamic import jika diperlukan untuk menghindari SSR problems.

Canvas default preview:

```text
350 × 350
```

Tetapi hasil export harus dapat mencapai:

```text
1080 × 1080
```

atau:

```text
2000 × 2000
```

---

# 10. PHOTO UPLOAD

User dapat memilih:

- JPG
- JPEG
- PNG
- WEBP

Setelah upload:

1. Foto masuk ke Fabric Canvas.
2. Foto dapat dipindahkan.
3. Foto dapat diperbesar.
4. Foto dapat diperkecil.
5. Foto dapat di-rotate.
6. Foto berada di belakang frame.
7. Frame tidak dapat dipindahkan.

Support mobile interaction:

- drag
- pinch zoom
- rotate jika memungkinkan
- touch gestures

Berikan instruction kecil:

> Geser untuk mengatur posisi foto.

Jangan membuat tutorial panjang.

---

# 11. FRAME SYSTEM

Buat data-driven frame configuration.

Contoh:

```ts
const frames = [
  {
    id: 'pkkmb-2026',
    name: 'PKKMB 2026',
    faculty: 'all',
    image: '/frames/pkkmb-2026.png'
  },
  {
    id: 'fst',
    name: 'Sains & Teknologi',
    faculty: 'fst',
    image: '/frames/fst.png'
  },
  {
    id: 'fisbis',
    name: 'Ilmu Sosial & Bisnis',
    faculty: 'fisbis',
    image: '/frames/fisbis.png'
  },
  {
    id: 'pasca',
    name: 'Pascasarjana',
    faculty: 'pasca',
    image: '/frames/pasca.png'
  }
]
```

Frame picker jangan dibuat menjadi grid card yang besar.

Gunakan thumbnail sederhana dengan:

- preview
- nama
- selected state

Selected state harus jelas tetapi elegan.

---

# 12. CANVAS LAYERING

Pastikan hierarchy Fabric.js:

```text
Photo
↓
Optional overlay
↓
Frame
```

Frame:

```ts
selectable = false
evented = false
```

Photo:

```ts
selectable = true
evented = true
```

Frame selalu berada di depan.

---

# 13. IMAGE CROPPING / POSITIONING

Foto harus dapat disesuaikan dengan frame.

Minimal controls:

### Position

- Drag

### Zoom

Mantine Slider.

### Rotation

Mantine Slider atau preset:

```text
-15°
0°
15°
```

Tambahkan tombol:

`Reset Position`

yang mengembalikan foto ke posisi default.

---

# 14. DOWNLOAD HIGH RESOLUTION

Jangan hanya export ukuran preview 350px.

Implementasikan export menggunakan canvas beresolusi tinggi.

Target:

```text
1080 × 1080
```

atau configurable:

```text
2000 × 2000
```

Export harus:

- PNG
- high resolution
- tetap mempertahankan frame
- tidak blur
- tidak menghasilkan UI/control
- hanya menghasilkan artwork

Filename:

```text
PKKMB-IWU-2026-{nama}.png
```

Jika nama belum tersedia:

```text
PKKMB-IWU-2026-Twibbon.png
```

---

# 15. CAPTION GENERATOR

Tambahkan section:

**Caption Generator**

Form:

```text
Nama Lengkap
Program Studi
Kelompok PKKMB
Motto / Quote
```

Gunakan Mantine:

- TextInput
- Select
- Textarea
- Button

Generate caption secara lokal.

Contoh output:

> Halo, saya [Nama], mahasiswa baru Program Studi [Prodi] International Women University.
>
> Saya siap menjadi bagian dari perjalanan PKKMB IWU 2026 bersama Kelompok [Kelompok].
>
> “[Motto]”
>
> Let's grow, learn, and lead together.
>
> #PKKMBIWU2026
> #InternationalWomenUniversity
> #FutureLeadersIWU

Caption harus dapat:

- preview
- copy
- regenerate

Gunakan Clipboard API.

Setelah berhasil copy:

```text
Caption berhasil disalin.
```

gunakan Mantine notification.

---

# 16. AGENDA PAGE

Route:

```text
/agenda
```

Tampilkan:

- tanggal
- waktu
- kegiatan
- lokasi
- status
- catatan

Jangan menggunakan tabel besar di mobile.

Gunakan vertical timeline atau compact list.

Contoh:

```text
08 SEP
08:00
Opening PKKMB

Gedung Utama IWU
```

Status dapat berupa:

- Upcoming
- Today
- Completed

Gunakan Mantine Badge.

---

# 17. PANDUAN

Masih di `/agenda` atau section terpisah.

Berikan:

### Sebelum PKKMB

- Persiapkan identitas mahasiswa
- Siapkan perangkat
- Download dokumen
- Gunakan Twibbon

### Saat PKKMB

- Hadir tepat waktu
- Ikuti instruksi panitia
- Gunakan atribut sesuai ketentuan

Gunakan Mantine Accordion agar mobile-friendly.

---

# 18. KELOMPOK

Route:

```text
/kelompok
```

User dapat memilih:

```text
Fakultas
Program Studi
Kelompok
```

Tampilkan:

```text
Kelompok 07

Pendamping:
Nama Pendamping

Anggota:
Nama
Nama
Nama
...
```

Gunakan search field untuk memudahkan pencarian.

Jangan menampilkan semua peserta sekaligus jika jumlahnya besar.

---

# 19. RESPONSIVE DESIGN

Mobile adalah prioritas pertama.

Breakpoints:

```text
mobile
tablet
desktop
```

Pada mobile:

- Canvas harus fit viewport.
- Controls menjadi vertical.
- Buttons minimum 44px touch target.
- Jangan ada horizontal overflow.
- Typography tetap nyaman.
- Modal menggunakan full-screen / Drawer jika diperlukan.

Target utama:

```text
360px
390px
430px
```

Website harus tetap nyaman digunakan pada HP Android kelas menengah.

---

# 20. PERFORMANCE

Karena website kemungkinan digunakan ribuan mahasiswa secara bersamaan:

Prioritaskan:

- Static rendering
- Client-side image processing
- lazy loading
- optimized assets
- minimal JavaScript yang tidak diperlukan
- dynamic import Fabric.js
- compressed frame assets
- WebP/PNG sesuai kebutuhan
- jangan upload foto ke server
- jangan menyimpan foto user

Foto Maba harus tetap berada di browser.

Tidak perlu backend untuk Twibbon.

---

# 21. PRIVACY

Tambahkan microcopy:

> Foto kamu diproses langsung di perangkat dan tidak diunggah ke server.

Ini penting karena user akan mengupload foto pribadi.

Jangan membuat upload endpoint server untuk fitur Twibbon.

---

# 22. STATIC DEPLOYMENT

Project harus kompatibel dengan cPanel menggunakan static export.

Gunakan:

```ts
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}
```

Pastikan tidak menggunakan fitur Next.js yang membutuhkan server runtime.

Hindari:

- API Routes
- Server Actions untuk core functionality
- SSR dependency
- database dependency

Build:

```bash
npm run build
```

Output:

```text
/out
```

Folder `out` dapat langsung ditempatkan di:

```text
public_html
```

---

# 23. PROJECT STRUCTURE

Gunakan struktur yang rapi:

```text
src/
├── app/
│   ├── page.tsx
│   ├── studio/
│   │   └── page.tsx
│   ├── agenda/
│   │   └── page.tsx
│   ├── kelompok/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   │
│   ├── studio/
│   │   ├── TwibbonCanvas.tsx
│   │   ├── FrameSelector.tsx
│   │   ├── PhotoUploader.tsx
│   │   ├── CanvasControls.tsx
│   │   ├── CaptionGenerator.tsx
│   │   └── DownloadButton.tsx
│   │
│   ├── agenda/
│   │   ├── AgendaTimeline.tsx
│   │   └── GuideAccordion.tsx
│   │
│   └── kelompok/
│       ├── GroupSearch.tsx
│       └── GroupMembers.tsx
│
├── data/
│   ├── frames.ts
│   ├── agenda.ts
│   └── groups.ts
│
├── lib/
│   ├── fabric.ts
│   ├── image-export.ts
│   └── caption-generator.ts
│
└── types/
    └── index.ts

public/
├── frames/
├── images/
└── icons/
```

---

# 24. COMPONENT ARCHITECTURE

Jangan membuat satu file `page.tsx` berisi seluruh aplikasi.

Pisahkan berdasarkan feature.

Gunakan reusable components.

Contoh:

```tsx
<TwibbonCanvas />

<FrameSelector />

<CanvasControls />

<CaptionGenerator />
```

State Fabric.js hanya berada di feature Twibbon.

Jangan memasukkan Fabric instance ke global state jika tidak diperlukan.

---

# 25. MANTINE CONFIGURATION

Gunakan Mantine Provider pada root application.

Konfigurasikan:

- font family
- primary color
- radius
- spacing
- headings

Namun jangan membuat seluruh UI terlihat seperti default Mantine.

Mantine digunakan sebagai foundation, lalu visual identity IWU diberikan melalui styling custom.

Gunakan radius moderat:

```text
sm / md / lg
```

Hindari:

```text
rounded-full
```

untuk hampir semua elemen.

---

# 26. ACCESSIBILITY

Implementasikan:

- semantic HTML
- accessible labels
- keyboard navigation
- sufficient contrast
- focus states
- alt text
- aria-label untuk icon-only buttons

Touch target minimum:

```text
44 × 44px
```

---

# 27. ERROR & EMPTY STATES

Tangani:

### User belum upload foto

Tampilkan:

> Upload foto untuk mulai membuat Twibbon.

### Format tidak didukung

> Gunakan JPG, PNG, atau WEBP.

### Foto terlalu besar

> Ukuran foto terlalu besar. Silakan pilih foto lain.

### Frame belum tersedia

> Frame PKKMB akan segera tersedia.

### Kelompok tidak ditemukan

> Kelompok yang kamu cari belum ditemukan.

Jangan menggunakan browser `alert()`.

Gunakan Mantine notification / Alert.

---

# 28. MICRO INTERACTIONS

Gunakan animasi sangat ringan.

Contoh:

- button hover
- tab transition
- canvas loading
- copy success
- download state

Hindari:

- parallax berlebihan
- floating animation
- infinite animation
- animated gradient
- bouncing elements

Motion harus mendukung UX, bukan menjadi dekorasi.

---

# 29. NAVIGATION

Desktop:

```text
IWU
PKKMB 2026

Home
Studio
Agenda
Kelompok

[ Buat Twibbon ]
```

Mobile:

Logo IWU / PKKMB di kiri.

Menu menggunakan Mantine Burger + Drawer atau navigation yang sesuai.

Navbar harus sticky tetapi tidak terlalu tinggi.

---

# 30. FOOTER

Minimal.

Contoh:

```text
International Women University

PKKMB 2026

Bandung, Indonesia

© 2026 International Women University
```

Tambahkan link:

- Website IWU
- Instagram
- Contact Panitia

Jangan membuat footer besar dengan banyak kolom.

---

# 31. DATA ARCHITECTURE

Untuk tahap awal gunakan static data.

Contoh:

```ts
export const agenda = [...]
export const groups = [...]
export const frames = [...]
```

Semua data mudah diganti tanpa mengubah komponen.

Jangan hardcode data langsung di JSX.

---

# 32. IMPORTANT: NO BACKEND

Untuk MVP ini:

**Tidak perlu backend.**

Semua fitur berikut harus berjalan client-side:

```text
Photo Upload
Fabric Canvas
Frame Selection
Photo Manipulation
Caption Generator
Copy Caption
Image Export
```

Foto tidak boleh dikirim ke server.

---

# 33. SEO

Set metadata:

Title:

```text
PKKMB IWU 2026 — International Women University
```

Description:

```text
Portal resmi PKKMB International Women University. Buat Twibbon, lihat agenda, panduan, dan informasi kelompok mahasiswa baru.
```

Open Graph image:

```text
/og-image.png
```

---

# 34. FINAL UX FLOW

User journey:

```text
Landing Page
      ↓
Klik "Buat Twibbon"
      ↓
Twibbon Studio
      ↓
Upload Foto
      ↓
Pilih Frame
      ↓
Atur Posisi
      ↓
Preview
      ↓
Download PNG
      ↓
Generate Caption
      ↓
Copy Caption
      ↓
Post ke Instagram
```

Flow harus terasa cepat.

Target:

**User dapat membuat Twibbon dalam kurang dari 60 detik.**

---

# 35. DEVELOPMENT RULES

Saat melakukan coding:

1. Jangan membuat mockup yang terlalu kompleks.
2. Prioritaskan fungsi terlebih dahulu.
3. Jangan menambahkan dependency tanpa alasan.
4. Jangan menggunakan placeholder yang terlihat seperti AI-generated.
5. Jangan menggunakan lorem ipsum.
6. Gunakan copy berbahasa Indonesia.
7. Gunakan data dummy yang realistis.
8. Gunakan nama program studi yang masuk akal.
9. Pastikan semua tombol memiliki fungsi.
10. Jangan membuat button yang hanya dekorasi.
11. Jangan membuat section yang tidak memiliki tujuan.
12. Jangan membuat dashboard-style UI.
13. Jangan menggunakan terlalu banyak card.
14. Jangan menggunakan gradient pada setiap section.
15. Jangan menggunakan emoji sebagai icon UI.
16. Gunakan Tabler Icons / Lucide Icons.
17. Jangan menggunakan `alert()`.
18. Pastikan tidak ada hydration error.
19. Pastikan Fabric.js tidak dijalankan saat SSR.
20. Pastikan `npm run build` berhasil.

---

# 36. EXPECTED OUTPUT

Buat aplikasi yang benar-benar runnable.

Output harus mencakup:

### Phase 1

Project setup:

```text
Next.js
TypeScript
Tailwind
Mantine
Fabric.js
```

### Phase 2

Implement:

```text
Navbar
Homepage
Studio
```

### Phase 3

Implement:

```text
Frame selector
Fabric canvas
Photo upload
Photo manipulation
High-resolution export
```

### Phase 4

Implement:

```text
Caption Generator
Agenda
Kelompok
```

### Phase 5

Polish:

```text
Responsive
Accessibility
Loading state
Error state
Empty state
Performance
SEO
```

### Phase 6

Verify:

```bash
npm run build
```

Pastikan static export berhasil menghasilkan:

```text
/out
```

---

# 37. DESIGN QUALITY CHECK

Sebelum menyelesaikan implementasi, evaluasi sendiri UI menggunakan pertanyaan berikut:

### Visual

- Apakah terlihat seperti website kampus profesional?
- Apakah terlalu banyak card?
- Apakah terlalu banyak gradient?
- Apakah terlihat seperti template AI?
- Apakah hierarchy visual jelas?
- Apakah navy menjadi visual anchor?

### Mobile

- Apakah nyaman digunakan dengan satu tangan?
- Apakah canvas cukup besar?
- Apakah button mudah disentuh?
- Apakah tidak terjadi horizontal scrolling?

### UX

- Apakah user langsung memahami apa yang harus dilakukan?
- Apakah workflow Twibbon dapat selesai dengan cepat?
- Apakah error state jelas?
- Apakah download mudah ditemukan?

### Technical

- Apakah Fabric.js hanya berjalan client-side?
- Apakah image tidak dikirim ke server?
- Apakah static export berhasil?
- Apakah tidak ada dependency yang membutuhkan Node runtime?

---

# FINAL INSTRUCTION

Jangan hanya menghasilkan landing page.

Bangun **produk digital PKKMB IWU yang functional**, dengan Twibbon Studio sebagai fitur utama.

Prioritaskan:

**Functionality > UX > Visual polish > Decoration**

Desain harus terasa:

**Elegant · Academic · Modern · Youthful · International · Human**

dan bukan:

**AI-generated SaaS template.**

Jika terdapat konflik antara dekorasi visual dan usability, selalu pilih usability.

Jika terdapat konflik antara fitur kompleks dan performa mobile, pilih solusi yang lebih ringan.

Semua fitur utama harus dapat bekerja tanpa backend dan harus kompatibel dengan **Next.js Static Export + cPanel**.