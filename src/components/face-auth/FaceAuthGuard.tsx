'use client';

// ─────────────────────────────────────────────────────────────────────────────
// FaceAuthGuard
// Client-side route protection. Redirect ke /admin/login jika tidak ada session.
// ⚠️ Ini adalah UX protection, bukan server-side security boundary.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { getSession } from '@/lib/auth/admin-auth';
import type { AdminSession } from '@/types/face-auth';

interface FaceAuthGuardProps {
  children: React.ReactNode;
}

export function FaceAuthGuard({ children }: FaceAuthGuardProps) {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null | undefined>(
    undefined // undefined = belum dicek
  );

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (!s) {
      router.replace('/admin/login');
    }
  }, [router]);

  // Belum dicek — tampilkan loading
  if (session === undefined) {
    return (
      <Center style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        <Stack align="center" gap={12}>
          <Loader size="sm" color="yellow" />
          <Text size="sm" c="dimmed">
            Memeriksa sesi...
          </Text>
        </Stack>
      </Center>
    );
  }

  // Tidak ada session — akan di-redirect
  if (!session) return null;

  return <>{children}</>;
}
