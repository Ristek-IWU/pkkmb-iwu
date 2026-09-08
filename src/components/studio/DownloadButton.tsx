"use client";

import { Button } from "@mantine/core";
import { IconDownload, IconLoader } from "@tabler/icons-react";

interface DownloadButtonProps {
  onDownload: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function DownloadButton({
  onDownload,
  disabled,
  loading,
}: DownloadButtonProps) {
  return (
    <Button
      fullWidth
      size="lg"
      onClick={onDownload}
      disabled={disabled || loading}
      loading={loading}
      leftSection={
        loading ? <IconLoader size={18} className="animate-spin" /> : <IconDownload size={18} />
      }
      color="navy.7"
    >
      Download PNG
    </Button>
  );
}
