import { AgendaItem } from '@/types';

export const agenda: AgendaItem[] = [
  {
    id: '1',
    tanggal: '08 SEP',
    waktu: '08:00',
    kegiatan: 'Opening PKKMB',
    lokasi: 'Gedung Utama IWU',
    status: 'upcoming',
    catatan: 'Hadir tepat waktu dengan atribut lengkap'
  },
  {
    id: '2',
    tanggal: '08 SEP',
    waktu: '10:00',
    kegiatan: 'Campus Tour',
    lokasi: 'Seluruh Kampus IWU',
    status: 'upcoming',
    catatan: 'Dibagi per kelompok'
  },
  {
    id: '3',
    tanggal: '09 SEP',
    waktu: '08:00',
    kegiatan: 'Workshop Kepemimpinan',
    lokasi: 'Lab Komputer',
    status: 'upcoming',
    catatan: 'Bawa laptop jika memungkinkan'
  },
  {
    id: '4',
    tanggal: '09 SEP',
    waktu: '13:00',
    kegiatan: 'Team Building',
    lokasi: 'Lapangan Utama',
    status: 'upcoming',
    catatan: 'Gunakan sepatu nyaman'
  },
  {
    id: '5',
    tanggal: '10 SEP',
    waktu: '08:00',
    kegiatan: 'Seminar Motivasi',
    lokasi: 'Auditorium',
    status: 'upcoming',
    catatan: ''
  },
  {
    id: '6',
    tanggal: '10 SEP',
    waktu: '15:00',
    kegiatan: 'Closing Ceremony',
    lokasi: 'Auditorium',
    status: 'upcoming',
    catatan: 'Foto bersama'
  }
];

export const guideSections = [
  {
    title: 'Sebelum PKKMB',
    items: [
      'Persiapkan identitas mahasiswa',
      'Siapkan perangkat (laptop/smartphone)',
      'Download dokumen yang diperlukan',
      'Gunakan Twibbon PKKMB',
      'Periksa jadwal dan lokasi'
    ]
  },
  {
    title: 'Saat PKKMB',
    items: [
      'Hadir tepat waktu',
      'Ikuti instruksi panitia',
      'Gunakan atribut sesuai ketentuan',
      'Jaga kesehatan dan stamina',
      ' aktif dalam setiap kegiatan'
    ]
  }
];
