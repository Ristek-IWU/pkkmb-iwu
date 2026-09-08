# Bug Report: Gambar Upload Tampil di Depan Frame

**Status:** ✅ Fixed  
**Severity:** Critical — Fitur utama (Twibbon Studio) tidak berfungsi dengan benar  
**File Bermasalah:** `src/components/studio/TwibbonCanvas.tsx`  
**Tanggal Ditemukan:** 9 September 2026  
**Tanggal Diperbaiki:** 9 September 2026

---

## Deskripsi Bug

Ketika user mengupload foto di Twibbon Studio, foto tampil **di depan (menutupi) frame** twibbon, bukan **di belakang frame** sebagaimana seharusnya.

**Expected:** Foto berada di belakang, frame twibbon berada di depan (overlay).  
**Actual:** Foto berada di depan, menutupi frame twibbon.

### Dampak
- User tidak bisa melihat frame twibbon setelah upload foto
- Hasil download twibbon tidak memiliki frame yang terlihat
- Fitur utama website (Twibbon Studio) broken

---

## Root Cause Analysis

Tiga masalah ditemukan di `TwibbonCanvas.tsx`:

### Masalah #1: Race Condition antara Dua `useEffect` Independen

Ada dua `useEffect` yang berjalan independen (satu untuk frame, satu untuk foto). Keduanya bersifat async. Karena Fabric.js menambahkan objek baru ke **paling atas** z-stack secara default, urutan rendering tidak bisa dijamin jika kedua efek berjalan hampir bersamaan.

**Skenario gagal:**
1. User pilih frame → `loadFrame` berjalan async (fetch SVG via network)
2. User langsung upload foto → `loadPhoto` selesai lebih cepat
3. Foto ditambahkan ke canvas, frame belum selesai di-load
4. `frameRef.current` masih `null` → `bringObjectToFront(frame)` tidak dipanggil
5. Frame selesai di-load belakangan dan ditambahkan ke canvas → tapi `bringObjectToFront` di `loadFrame` hanya dipanggil jika `photoRef.current` ada, bukan secara unconditional

### Masalah #2: SVG Dimensions Bisa `undefined`

`loadSVGFromURL` di Fabric.js v6 mengembalikan `SVGParsingOutput`. Field `result.options.width` bisa `undefined` jika SVG tidak memiliki atribut `width`/`height` eksplisit (hanya punya `viewBox`). Ini menyebabkan `Math.max(undefined, undefined) = NaN` → `scale = NaN` → frame tidak ter-render sama sekali.

### Masalah #3: Z-Order Tidak Dijaga saat Transformasi

`enforceLayerOrder` hanya dipanggil saat load awal, tidak saat zoom/rotate/reset dijalankan. Operasi transformasi Fabric.js bisa secara internal mempengaruhi rendering order dalam edge cases tertentu.

---

## Fix yang Diterapkan

### Pendekatan: `enforceLayerOrder` Helper

Dibuat sebuah fungsi terpusat `enforceLayerOrder(canvas)` yang selalu memanggil:

```typescript
canvas.sendObjectToBack(photoRef.current);   // foto ke belakang
canvas.bringObjectToFront(frameRef.current); // frame ke depan
canvas.renderAll();
```

Fungsi ini dipanggil di **setiap titik** yang bisa mengubah state canvas:

| Titik Pemanggilan | Alasan |
|-------------------|--------|
| Selesai load frame | Frame baru harus langsung di depan |
| Selesai load foto | Foto baru harus langsung di belakang frame |
| Setiap perubahan zoom | Pastikan transformasi tidak ganggu z-order |
| Setiap perubahan rotation | Sama seperti zoom |
| Sebelum export PNG | Hasil download harus selalu benar |
| Reset position | Setelah reset, urutan dipertegas ulang |

### Fix SVG Dimensions

```typescript
// Sebelum (buggy):
const svgW = result.options.width || 1080;  // 0 dianggap falsy → salah

// Sesudah (fix):
const svgW =
  result.options?.width && result.options.width > 0
    ? result.options.width
    : 1080;
```

### Tambahan: `setCoords()` setelah setiap transformasi

Fabric.js v6 memerlukan `setCoords()` setelah mengubah posisi/scale objek secara programatik agar bounding box dan hit detection tetap akurat.

---

## Kode Perubahan Utama

```typescript
// Helper terpusat — dipanggil dari semua efek
const enforceLayerOrder = useCallback((canvas: any) => {
  if (photoRef.current) {
    canvas.sendObjectToBack(photoRef.current);
  }
  if (frameRef.current) {
    canvas.bringObjectToFront(frameRef.current);
  }
  canvas.renderAll();
}, []);

// Dipanggil di akhir loadFrame, loadPhoto, zoom effect, rotation effect,
// exportCanvas, dan resetPosition
```

---

## Verifikasi Setelah Fix

### Test Case Manual

| # | Skenario | Expected Result | Status |
|---|----------|----------------|--------|
| 1 | Pilih frame → upload foto | Foto di belakang frame | ✅ |
| 2 | Upload foto → pilih frame | Frame menutupi foto | ✅ |
| 3 | Upload foto → pilih frame → ganti frame | Frame baru tetap di depan foto | ✅ |
| 4 | Upload foto → zoom/rotate | Frame tetap di depan setelah manipulasi | ✅ |
| 5 | Upload foto → ganti foto baru | Foto baru tetap di belakang frame | ✅ |
| 6 | Upload foto → download PNG | Hasil PNG menunjukkan frame di depan foto | ✅ |

---

## Catatan Teknis: Fabric.js v6 Z-Order API

| Method | Behavior |
|--------|----------|
| `sendObjectToBack(obj)` | Pindahkan objek ke posisi paling belakang (z-index 0) |
| `sendObjectBackwards(obj)` | Pindahkan objek 1 posisi ke belakang |
| `bringObjectForward(obj)` | Pindahkan objek 1 posisi ke depan ← **JANGAN GUNAKAN INI** |
| `bringObjectToFront(obj)` | Pindahkan objek ke posisi **paling depan** ← **YANG BENAR** |

> ⚠️ `bringObjectForward` hanya naik 1 posisi. Jika ada lebih dari 2 objek,
> frame tidak dijamin berada paling depan. Selalu gunakan `bringObjectToFront`.

---

## File yang Diubah

- `src/components/studio/TwibbonCanvas.tsx` — seluruh logika canvas dirstrukturisasi
