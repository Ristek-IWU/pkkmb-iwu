"use client";

import { ReactNode } from "react";
import { Stack, Text, Title } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Stack align="center" py={48} ta="center">
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "#F8FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {icon || <IconInbox size={32} color="#64748B" />}
      </div>
      <Title order={4} fw={600} c="navy.7" mb={8}>
        {title}
      </Title>
      <Text size="sm" c="dimmed" maw={400} mb={16}>
        {description}
      </Text>
      {action}
    </Stack>
  );
}
