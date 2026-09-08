'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Stack,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Group,
  Badge,
  Button,
  Alert,
  ThemeIcon,
} from '@mantine/core';
import {
  IconUsers,
  IconCalendar,
  IconPhoto,
  IconShieldCheck,
  IconInfoCircle,
  IconUser,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import { FaceAuthGuard } from '@/components/face-auth/FaceAuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getSession } from '@/lib/auth/admin-auth';
import { hasFaceProfile } from '@/lib/auth/admin-storage';
import type { AdminSession } from '@/types/face-auth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [faceEnrolled, setFaceEnrolled] = useState(false);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (s) {
      hasFaceProfile(s.adminId).then(setFaceEnrolled);
    }
  }, []);

  const authTime = session
    ? new Date(session.authenticatedAt).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const expireTime = session
    ? new Date(session.expiresAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <FaceAuthGuard>
      <AdminLayout activePage="dashboard">
        <Container size="lg" py={24}>
          <Stack gap={28}>
            {/* Welcome */}
            <div>
              <Title order={2} fw={700} c="#0A192F" mb={4}>
                Dashboard Admin
              </Title>
              {session && (
                <Text c="dimmed" size="sm">
                  Selamat datang,{' '}
                  <Text span fw={500} c="#0A192F">
                    {session.adminName}
                  </Text>
                  {' '}— sesi berakhir pukul {expireTime}
                </Text>
              )}
            </div>

            {/* Setup reminder */}
            {!faceEnrolled && (
              <Alert
                icon={<IconInfoCircle size={16} />}
                color="yellow"
                radius="md"
                title="Verifikasi wajah belum diaktifkan"
              >
                <Stack gap={8}>
                  <Text size="sm">
                    Daftarkan wajah kamu agar login berikutnya memerlukan
                    verifikasi wajah.
                  </Text>
                  <Button
                    size="xs"
                    color="yellow"
                    variant="light"
                    onClick={() => router.push('/admin/setup-face')}
                  >
                    Setup Sekarang
                  </Button>
                </Stack>
              </Alert>
            )}

            {/* Session card */}
            <Paper withBorder radius="md" p="lg" style={{ borderColor: '#E2E8F0' }}>
              <Group gap={12} mb={16}>
                <ThemeIcon size={40} radius="md" color="navy.7" variant="light">
                  <IconShieldCheck size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={600} c="#0A192F" size="sm">
                    Sesi Aktif
                  </Text>
                  <Text size="xs" c="dimmed">
                    Autentikasi {session?.method ?? '—'}
                  </Text>
                </div>
                <Badge
                  color="teal"
                  variant="light"
                  size="sm"
                  style={{ marginLeft: 'auto' }}
                >
                  Terverifikasi
                </Badge>
              </Group>

              <SimpleGrid cols={{ base: 1, xs: 2 }} spacing={12}>
                <InfoRow label="Admin" value={session?.adminName ?? '—'} />
                <InfoRow label="Metode" value={session?.method ?? '—'} />
                <InfoRow label="Login pada" value={authTime} />
                <InfoRow
                  label="Face Auth"
                  value={faceEnrolled ? 'Aktif ✓' : 'Belum diatur'}
                />
              </SimpleGrid>
            </Paper>

            {/* Quick actions */}
            <div>
              <Text fw={600} c="#0A192F" mb={12}>
                Menu Admin
              </Text>
              <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing={12}>
                <ActionCard
                  icon={<IconPhoto size={20} />}
                  label="Frame Twibbon"
                  desc="Kelola frame PKKMB"
                  color="#7C3AED"
                  onClick={() => router.push('/')}
                />
                <ActionCard
                  icon={<IconCalendar size={20} />}
                  label="Agenda"
                  desc="Kelola jadwal PKKMB"
                  color="#D4AF37"
                  onClick={() => router.push('/agenda')}
                />
                <ActionCard
                  icon={<IconUsers size={20} />}
                  label="Kelompok"
                  desc="Data kelompok peserta"
                  color="#0A192F"
                  onClick={() => {}}
                />
                <ActionCard
                  icon={<IconUser size={20} />}
                  label="Setup Wajah"
                  desc="Perbarui face profile"
                  color="#10B981"
                  onClick={() => router.push('/admin/setup-face')}
                />
              </SimpleGrid>
            </div>

            {/* Security notice */}
            <Alert
              icon={<IconInfoCircle size={14} />}
              color="gray"
              variant="light"
              radius="md"
            >
              <Text size="xs" c="dimmed">
                ⚠️ Ini adalah client-side authentication untuk keperluan
                internal. Tidak ditujukan sebagai security boundary tingkat
                tinggi. Jangan tinggalkan perangkat tanpa pengawasan.
              </Text>
            </Alert>
          </Stack>
        </Container>
      </AdminLayout>
    </FaceAuthGuard>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="xs" c="dimmed" mb={2}>
        {label}
      </Text>
      <Text size="sm" fw={500} c="#0A192F">
        {value}
      </Text>
    </div>
  );
}

function ActionCard({
  icon,
  label,
  desc,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      onClick={onClick}
      style={{
        borderColor: '#E2E8F0',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = color;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 8px rgba(0,0,0,0.06)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <Group gap={10} mb={6}>
        <ThemeIcon
          size={32}
          radius="md"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {icon}
        </ThemeIcon>
      </Group>
      <Text size="sm" fw={600} c="#0A192F">
        {label}
      </Text>
      <Text size="xs" c="dimmed">
        {desc}
      </Text>
    </Paper>
  );
}
