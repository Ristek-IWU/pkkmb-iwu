import { CaptionForm } from '@/types';

export const captionTemplate = (data: CaptionForm): string => {
  return `Halo, saya ${data.nama}, mahasiswa baru Program Studi ${data.prodi} International Women University.

Saya siap menjadi bagian dari perjalanan PKKMB IWU 2026 bersama Kelompok ${data.kelompok}.

"${data.motto}"

Let's grow, learn, and lead together.

#PKKMBIWU2026
#InternationalWomenUniversity
#FutureLeadersIWU`;
};

export const alternativeTemplates = [
  (data: CaptionForm) => `Hi everyone!

Saya ${data.nama}, mahasiswa baru Prodi ${data.prodi} di International Women University.

Senang bisa bergabung di Kelompok ${data.kelompok} PKKMB 2026!

"${data.motto}"

#PKKMBIWU2026 #IWU #FutureLeaders`,

  (data: CaptionForm) => `Assalamualaikum!

Perkenalkan, saya ${data.nama} dari Program Studi ${data.prodi}, International Women University.

Bergabung di Kelompok ${data.kelompok} PKKMB 2026!

"${data.motto}"

Let's make this journey memorable!

#PKKMBIWU2026 #InternationalWomenUniversity`
];

export const generateCaption = (data: CaptionForm): string => {
  return captionTemplate(data);
};

export const generateRandomCaption = (data: CaptionForm): string => {
  const templates = [captionTemplate, ...alternativeTemplates];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex](data);
};
