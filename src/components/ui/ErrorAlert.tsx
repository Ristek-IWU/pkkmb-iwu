"use client";

import { Alert, Button } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({
  title = "Terjadi Kesalahan",
  message,
  onRetry,
}: ErrorAlertProps) {
  return (
    <Alert
      color="red"
      title={title}
      icon={<IconAlertCircle size={16} />}
      withCloseButton={false}
    >
      <p className="mb-3">{message}</p>
      {onRetry && (
        <Button
          size="compact-sm"
          variant="light"
          color="red"
          leftSection={<IconRefresh size={14} />}
          onClick={onRetry}
        >
          Coba Lagi
        </Button>
      )}
    </Alert>
  );
}
