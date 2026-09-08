"use client";

import { AgendaItem } from "@/types";
import { Badge, Paper, Text, Stack, Group } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";

interface AgendaTimelineProps {
  agenda: AgendaItem[];
}

const statusColors: Record<string, string> = {
  upcoming: "gray",
  today: "navy.7",
  completed: "green",
};

const statusLabels: Record<string, string> = {
  upcoming: "Upcoming",
  today: "Today",
  completed: "Completed",
};

export function AgendaTimeline({ agenda }: AgendaTimelineProps) {
  return (
    <Stack gap={16}>
      {agenda.map((item, index) => (
        <div key={item.id} style={{ display: "flex", gap: 16 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor:
                  item.status === "today"
                    ? "#7C3AED"
                    : item.status === "completed"
                    ? "#40C057"
                    : "#E2E8F0",
              }}
            />
            {index < agenda.length - 1 && (
              <div
                style={{
                  width: 1,
                  flex: 1,
                  backgroundColor: "#E2E8F0",
                }}
              />
            )}
          </div>

          <Paper p="md" withBorder radius="md" style={{ flex: 1 }}>
            <Group justify="space-between" mb={8} wrap="nowrap">
              <Group gap={8}>
                <Text fw={700} c="navy.7">
                  {item.tanggal}
                </Text>
                <Text size="sm" c="dimmed">
                  {item.waktu}
                </Text>
              </Group>
              <Badge color={statusColors[item.status]} size="sm" variant="light">
                {statusLabels[item.status]}
              </Badge>
            </Group>

            <Text fw={600} c="navy.7" mb={8}>
              {item.kegiatan}
            </Text>

            <Group gap={4} mb={item.catatan ? 8 : 0}>
              <IconMapPin size={14} color="#64748B" />
              <Text size="sm" c="dimmed">
                {item.lokasi}
              </Text>
            </Group>

            {item.catatan && (
              <Text size="xs" c="dimmed" fs="italic" mt={8}>
                {item.catatan}
              </Text>
            )}
          </Paper>
        </div>
      ))}
    </Stack>
  );
}
