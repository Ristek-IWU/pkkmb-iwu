# Changelog

## PKKMB IWU — Release History

---

## [Unreleased] — 9 September 2026

### Fixed
- **[CRITICAL] Foto upload tampil di depan frame twibbon** (`TwibbonCanvas.tsx`)
  - Root cause: race condition antara dua `useEffect` async yang independen, ditambah SVG dimensions yang bisa `undefined` (Fabric.js v6)
  - Fix: dibuat helper `enforceLayerOrder` yang dipanggil di setiap titik yang bisa mengubah state canvas (load frame, load foto, zoom, rotation, export, reset)
  - Fix tambahan: SVG dimensions fallback yang aman (`width > 0` check, bukan hanya truthy)
  - Fix tambahan: `setCoords()` dipanggil setelah setiap transformasi programatik
  - Lihat detail: [`BUGFIX-FRAME-LAYERING.md`](./BUGFIX-FRAME-LAYERING.md)

### Changed
- `TwibbonCanvas.tsx` — Refactor logika canvas:
  - Tambah `enforceLayerOrder` sebagai single source of truth untuk z-ordering
  - Tambah proper cleanup (`null`-kan refs) saat unmount
  - Tambah `setCoords()` setelah setiap perubahan posisi/scale
  - Perbaiki SVG dimension parsing untuk SVG tanpa atribut `width`/`height` eksplisit
  - Tambah `enforceLayerOrder` pada `exportCanvas` untuk menjamin hasil download selalu benar

---

## [1.0.0] — September 2026

### Added
- Homepage (`/`) dengan hero section dan navigasi ke fitur utama
- Twibbon Studio (`/studio`) dengan Fabric.js canvas
  - Upload foto (JPG, PNG, WEBP, maks 10MB)
  - Pilih frame twibbon (PKKMB 2026, FST, FISBIS, Pascasarjana)
  - Drag, zoom, dan rotate foto di canvas
  - Export PNG 1080×1080
- Caption Generator di halaman Studio
  - Form: nama, prodi, kelompok, motto
  - Beberapa template caption
  - Copy to clipboard
- Agenda Page (`/agenda`) dengan timeline dan panduan
- Layout components: Navbar, Footer
- Static data: frames, agenda
- Dokumentasi: PRD, ARCHITECTURE, COMPONENTS, DATA, DEPLOYMENT
