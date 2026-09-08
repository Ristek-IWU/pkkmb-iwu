"use client";

import Link from "next/link";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Grid,
  Paper,
} from "@mantine/core";
import { IconArrowRight, IconCalendar, IconSparkles } from "@tabler/icons-react";

export default function Home() {
  return (
    <div>
      <Container size="xl" py={80}>
        <div style={{ maxWidth: 640 }}>
          <Text
            size="sm"
            fw={600}
            c="accent"
            tt="uppercase"
            style={{ letterSpacing: "0.1em" }}
            mb={16}
          >
            PKKMB 2026
          </Text>
          <Title
            order={1}
            size="h1"
            fw={700}
            c="navy.7"
            style={{ lineHeight: 1.1, letterSpacing: "-0.02em" }}
          >
            Welcome, Future Leaders.
          </Title>
          <Text size="lg" c="dimmed" mt={24} maw={500} style={{ lineHeight: 1.6 }}>
            Mulai perjalananmu di International Women University dan abadikan
            momen pertama sebagai bagian dari keluarga IWU.
          </Text>
          <Group mt={32} gap={16}>
            <Link href="/studio" style={{ textDecoration: "none" }}>
              <Button
                size="lg"
                variant="filled"
                color="navy"
                rightSection={<IconArrowRight size={16} />}
              >
                Buat Twibbon
              </Button>
            </Link>
            <Link href="/agenda" style={{ textDecoration: "none" }}>
              <Button
                size="lg"
                variant="outline"
                color="navy"
                leftSection={<IconCalendar size={16} />}
              >
                Lihat Agenda
              </Button>
            </Link>
          </Group>
          <Text size="sm" c="dimmed" mt={32}>
            International Women University &middot; Bandung
          </Text>
        </div>
      </Container>

      <Container size="xl" py={64} style={{ borderTop: "1px solid #E2E8F0" }}>
        <Grid gutter={32}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="xl" withBorder radius="md">
              <Group mb={12}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                    backgroundColor: "#F5F0FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconSparkles size={20} color="#7C3AED" />
                </div>
              </Group>
              <Text fw={600} c="navy.7" mb={8}>
                Twibbon Studio
              </Text>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                Buat foto twibbon PKKMB langsung di browser. Pilih frame, atur
                posisi, dan download hasilnya.
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="xl" withBorder radius="md">
              <Group mb={12}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                    backgroundColor: "#FEF3C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconCalendar size={20} color="#D4AF37" />
                </div>
              </Group>
              <Text fw={600} c="navy.7" mb={8}>
                Agenda PKKMB
              </Text>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                Lihat jadwal lengkap kegiatan PKKMB. Persiapkan diri untuk setiap
                rangkaian acara.
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
}
