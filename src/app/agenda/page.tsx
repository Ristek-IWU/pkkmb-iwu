"use client";

import { Container, Title, Text, Grid } from "@mantine/core";
import { agenda, guideSections } from "@/data/agenda";
import { AgendaTimeline } from "@/components/agenda/AgendaTimeline";
import { GuideAccordion } from "@/components/agenda/GuideAccordion";

export default function AgendaPage() {
  return (
    <Container size="xl" py={32}>
      <div style={{ marginBottom: 32 }}>
        <Title order={1} size="h2" fw={700} c="navy.7">
          Agenda PKKMB
        </Title>
        <Text c="dimmed" mt={8}>
          Jadwal dan panduan kegiatan PKKMB IWU 2026
        </Text>
      </div>

      <Grid gutter={32}>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Title order={3} size="h4" fw={600} c="navy.7" mb={24}>
            Jadwal Kegiatan
          </Title>
          <AgendaTimeline agenda={agenda} />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Title order={3} size="h4" fw={600} c="navy.7" mb={24}>
            Panduan PKKMB
          </Title>
          <GuideAccordion sections={guideSections} />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
