"use client";

import { Loader, Text, Stack } from "@mantine/core";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  return (
    <Stack align="center" gap={12}>
      <Loader size={size === "sm" ? "sm" : size === "md" ? "md" : "xl"} />
      {text && (
        <Text size="sm" c="dimmed">
          {text}
        </Text>
      )}
    </Stack>
  );
}
