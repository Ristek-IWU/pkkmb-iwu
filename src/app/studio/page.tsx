"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Divider,
} from "@mantine/core";
import { Frame } from "@/types";
import { frames } from "@/data/frames";
import { TwibbonCanvas } from "@/components/studio/TwibbonCanvas";
import { FrameSelector } from "@/components/studio/FrameSelector";
import { PhotoUploader } from "@/components/studio/PhotoUploader";
import { CanvasControls } from "@/components/studio/CanvasControls";
import { DownloadButton } from "@/components/studio/DownloadButton";
import { CaptionGenerator } from "@/components/studio/CaptionGenerator";
import { readAdminStorage } from "@/lib/admin-storage";

export default function StudioPage() {
  const [availableFrames, setAvailableFrames] = useState(frames);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);

  const canvasRef = useRef<any>(null);

  useEffect(() => {
    setAvailableFrames(readAdminStorage("pkkmb-admin-frames", frames));
  }, []);

  const handleFrameSelect = useCallback((frame: Frame) => {
    setSelectedFrame(frame);
  }, []);

  const handlePhotoUpload = useCallback((file: File) => {
    setPhoto(file);
    setHasPhoto(true);
    setZoom(1);
    setRotation(0);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    if (canvasRef.current) {
      canvasRef.current.resetPosition();
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      const dataUrl = canvasRef.current.exportCanvas(1080, 1080);
      const link = document.createElement("a");
      link.download = "PKKMB-IWU-2026-Twibbon.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  }, []);

  return (
    <Container size="xl" py={32}>
      <div style={{ marginBottom: 32 }}>
        <Title order={1} size="h2" fw={700} c="navy.7">
          Twibbon Studio
        </Title>
        <Text c="dimmed" mt={8}>
          Buat foto twibbon PKKMB IWU 2026 kamu
        </Text>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Left sidebar - Frame selector */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <Paper p="md" withBorder radius="md">
            <Text fw={600} c="navy.7" mb={12}>
              Pilih Frame
            </Text>
            <FrameSelector
              frames={availableFrames}
              selectedFrame={selectedFrame}
              onSelect={handleFrameSelect}
            />
          </Paper>
        </div>

        {/* Center - Canvas */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Paper p="md" withBorder radius="md">
            <TwibbonCanvas
              selectedFrame={selectedFrame}
              photo={photo}
              zoom={zoom}
              rotation={rotation}
              onCanvasReady={(canvas) => {
                canvasRef.current = canvas;
              }}
            />
          </Paper>
          <Text size="xs" c="dimmed" ta="center" mt={12}>
            Geser untuk mengatur posisi foto
          </Text>
        </div>

        {/* Right sidebar - Controls */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <Stack gap="md">
            <Paper p="md" withBorder radius="md">
              <Text fw={600} c="navy.7" mb={12}>
                Upload Foto
              </Text>
              <PhotoUploader
                onUpload={handlePhotoUpload}
                disabled={!selectedFrame}
              />
            </Paper>

            <Paper p="md" withBorder radius="md">
              <Text fw={600} c="navy.7" mb={12}>
                Atur Foto
              </Text>
              <CanvasControls
                zoom={zoom}
                rotation={rotation}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onReset={handleReset}
                disabled={!hasPhoto}
              />
            </Paper>

            <Paper p="md" withBorder radius="md">
              <DownloadButton
                onDownload={handleExport}
                disabled={!hasPhoto}
                loading={exporting}
              />
            </Paper>
          </Stack>
        </div>
      </div>

      <Divider my={48} />

      <CaptionGenerator />
    </Container>
  );
}
