"use client";

import { useRef } from "react";
import { Button, Text, Stack } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";

interface PhotoUploaderProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export function PhotoUploader({ onUpload, disabled }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert("Gunakan JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > MAX_SIZE) {
      alert("Ukuran foto terlalu besar. Silakan pilih foto lain.");
      return;
    }

    onUpload(file);
  };

  return (
    <Stack gap={8}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <Button
        variant="light"
        color="gray"
        fullWidth
        leftSection={<IconUpload size={16} />}
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        style={{
          borderStyle: "dashed",
          borderWidth: 2,
          height: 56,
        }}
      >
        {disabled ? "Pilih frame terlebih dahulu" : "Upload Foto"}
      </Button>
      <Text size="xs" c="dimmed" ta="center">
        JPG, PNG, atau WEBP (maks. 10MB)
      </Text>
    </Stack>
  );
}
