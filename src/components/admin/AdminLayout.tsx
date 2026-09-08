'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppShell,
  Group,
  Text,
  Button,
  Stack,
  NavLink,
  Divider,
  Badge,
  UnstyledButton,
  Modal,
} from '@mantine/core';
import {
  IconLayoutDashboard,
  IconUser,
  IconLogout,
  IconShieldCheck,
} from '@tabler/icons-react';
import { clearSession, getSession } from '@/lib/auth/admin-auth';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage?: 'dashboard' | 'setup-face';
}

export function AdminLayout({ children, activePage = 'dashboard' }: AdminLayoutProps) {
  const router = useRouter();
  const session = getSession();
  const [logoutModal, setLogoutModal] = useState(false);

  const handleLogout = () => {
    clearSession();
    router.replace('/admin/login');
  };

  return (
    <>
      <AppShell
        header={{ height: 56 }}
        navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: true } }}
        padding="md"
        styles={{
          root: { backgroundColor: '#F8FAFC' },
          header: {
            backgroundColor: '#0A192F',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          },
          navbar: {
            backgroundColor: '#0F2042',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          },
          main: { backgroundColor: '#F8FAFC' },
        }}
      >
        {/* Header */}
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group gap={8}>
              <IconShieldCheck size={20} color="#D4AF37" />
              <Text fw={600} c="white" size="sm">
                IWU Admin
              </Text>
              <Badge color="yellow" variant="light" size="xs">
                PKKMB 2026
              </Badge>
            </Group>

            {session && (
              <Group gap={8}>
                <Text size="xs" c="gray.4" visibleFrom="sm">
                  {session.adminName}
                </Text>
                <UnstyledButton
                  onClick={() => setLogoutModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  aria-label="Logout"
                >
                  <IconLogout size={16} color="#94A3B8" />
                </UnstyledButton>
              </Group>
            )}
          </Group>
        </AppShell.Header>

        {/* Navbar */}
        <AppShell.Navbar p="sm">
          <Stack gap={4} mt={8}>
            <NavLink
              label="Dashboard"
              leftSection={<IconLayoutDashboard size={16} />}
              active={activePage === 'dashboard'}
              onClick={() => router.push('/admin/dashboard')}
              styles={{
                root: {
                  borderRadius: 8,
                  color: activePage === 'dashboard' ? '#D4AF37' : '#94A3B8',
                  backgroundColor:
                    activePage === 'dashboard'
                      ? 'rgba(212,175,55,0.1)'
                      : 'transparent',
                },
                label: { fontSize: 14 },
              }}
            />
            <NavLink
              label="Setup Wajah"
              leftSection={<IconUser size={16} />}
              active={activePage === 'setup-face'}
              onClick={() => router.push('/admin/setup-face')}
              styles={{
                root: {
                  borderRadius: 8,
                  color: activePage === 'setup-face' ? '#D4AF37' : '#94A3B8',
                  backgroundColor:
                    activePage === 'setup-face'
                      ? 'rgba(212,175,55,0.1)'
                      : 'transparent',
                },
                label: { fontSize: 14 },
              }}
            />
          </Stack>

          <Divider my={16} color="rgba(255,255,255,0.08)" />

          {session && (
            <Stack gap={4} px={4}>
              <Text size="xs" c="gray.6" tt="uppercase" fw={600} mb={4}>
                Sesi Aktif
              </Text>
              <Text size="xs" c="gray.5">
                {session.adminName}
              </Text>
              <Text size="xs" c="gray.6">
                Berakhir:{' '}
                {new Date(session.expiresAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Stack>
          )}

          <div style={{ marginTop: 'auto' }}>
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              fullWidth
              leftSection={<IconLogout size={14} />}
              onClick={() => setLogoutModal(true)}
              styles={{ root: { color: '#64748B' } }}
            >
              Logout
            </Button>
          </div>
        </AppShell.Navbar>

        {/* Main content */}
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      {/* Logout confirmation */}
      <Modal
        opened={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Konfirmasi Logout"
        centered
        size="sm"
        radius="md"
      >
        <Text size="sm" c="dimmed" mb={20}>
          Sesi kamu akan berakhir dan kamu akan diarahkan ke halaman login.
        </Text>
        <Group justify="flex-end" gap={8}>
          <Button variant="subtle" color="gray" onClick={() => setLogoutModal(false)}>
            Batal
          </Button>
          <Button color="red" variant="light" onClick={handleLogout}>
            Logout
          </Button>
        </Group>
      </Modal>
    </>
  );
}
