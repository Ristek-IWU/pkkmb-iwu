"use client";

import { useState } from "react";
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Text,
  Paper,
  Group,
  Title,
} from "@mantine/core";
import { IconCopy, IconRefresh } from "@tabler/icons-react";
import { CaptionForm } from "@/types";
import { generateCaption, generateRandomCaption } from "@/lib/caption-generator";

interface CaptionGeneratorProps {
  onCopy?: (caption: string) => void;
}

const prodiOptions = [
  { value: "Informatika", label: "Informatika" },
  { value: "Sistem Informasi", label: "Sistem Informasi" },
  { value: "Teknik Informatika", label: "Teknik Informatika" },
  { value: "Manajemen", label: "Manajemen" },
  { value: "Akuntansi", label: "Akuntansi" },
  { value: "Ekonomi", label: "Ekonomi" },
  { value: "Magister Manajemen", label: "Magister Manajemen" },
  { value: "Magister Teknik", label: "Magister Teknik" },
];

const kelompokOptions = Array.from({ length: 8 }, (_, i) => ({
  value: `Kelompok ${(i + 1).toString().padStart(2, "0")}`,
  label: `Kelompok ${(i + 1).toString().padStart(2, "0")}`,
}));

export function CaptionGenerator({ onCopy }: CaptionGeneratorProps) {
  const [form, setForm] = useState<CaptionForm>({
    nama: "",
    prodi: "",
    kelompok: "",
    motto: "",
  });
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = (random = false) => {
    if (!form.nama || !form.prodi || !form.kelompok) return;
    const caption = random ? generateRandomCaption(form) : generateCaption(form);
    setGeneratedCaption(caption);
  };

  const handleCopy = async () => {
    if (!generatedCaption) return;
    try {
      await navigator.clipboard.writeText(generatedCaption);
      setCopied(true);
      if (onCopy) onCopy(generatedCaption);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <Title order={2} size="h3" fw={600} c="navy.7" mb={8}>
        Caption Generator
      </Title>
      <Text size="sm" c="dimmed" mb={24}>
        Buat caption Instagram untuk twibbon PKKMB kamu
      </Text>

      <Stack gap="md">
        <TextInput
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          required
        />

        <Select
          label="Program Studi"
          placeholder="Pilih program studi"
          data={prodiOptions}
          value={form.prodi}
          onChange={(value) => setForm({ ...form, prodi: value || "" })}
          required
        />

        <Select
          label="Kelompok PKKMB"
          placeholder="Pilih kelompok"
          data={kelompokOptions}
          value={form.kelompok}
          onChange={(value) => setForm({ ...form, kelompok: value || "" })}
          required
        />

        <Textarea
          label="Motto / Quote"
          placeholder="Masukkan motto atau quote kamu (opsional)"
          value={form.motto}
          onChange={(e) => setForm({ ...form, motto: e.target.value })}
          minRows={2}
        />

        <Group gap="sm">
          <Button
            onClick={() => handleGenerate(false)}
            disabled={!form.nama || !form.prodi || !form.kelompok}
            color="navy.7"
          >
            Generate Caption
          </Button>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={() => handleGenerate(true)}
            disabled={!form.nama || !form.prodi || !form.kelompok}
          >
            Acak Template
          </Button>
        </Group>

        {generatedCaption && (
          <Paper p="md" withBorder radius="md" style={{ backgroundColor: "#F8FAFC" }}>
            <Text size="sm" fw={500} mb={8}>
              Preview:
            </Text>
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }} mb={12}>
              {generatedCaption}
            </Text>
            <Button
              size="sm"
              variant="light"
              leftSection={<IconCopy size={14} />}
              onClick={handleCopy}
              color={copied ? "green" : "accent"}
            >
              {copied ? "Tersalin!" : "Copy Caption"}
            </Button>
          </Paper>
        )}

        {copied && (
          <Text size="sm" c="green" ta="center">
            Caption berhasil disalin.
          </Text>
        )}
      </Stack>
    </div>
  );
}
