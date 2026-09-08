export interface Frame {
  id: string;
  name: string;
  faculty: 'all' | 'fst' | 'fisbis' | 'pasca';
  image: string;
}

export interface AgendaItem {
  id: string;
  tanggal: string;
  waktu: string;
  kegiatan: string;
  lokasi: string;
  status: 'upcoming' | 'today' | 'completed';
  catatan?: string;
}

export interface CaptionForm {
  nama: string;
  prodi: string;
  kelompok: string;
  motto: string;
}
