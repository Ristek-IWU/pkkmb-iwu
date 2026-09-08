"use client";

import { Slider, Button, Group, Stack, Text } from "@mantine/core";
import { IconRotate } from "@tabler/icons-react";

interface CanvasControlsProps {
  zoom: number;
  rotation: number;
  onZoomChange: (zoom: number) => void;
  onRotationChange: (rotation: number) => void;
  onReset: () => void;
  disabled?: boolean;
}

export function CanvasControls({
  zoom,
  rotation,
  onZoomChange,
  onRotationChange,
  onReset,
  disabled,
}: CanvasControlsProps) {
  return (
    <Stack
      gap="md"
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto" }}
    >
      <div>
        <Group justify="space-between" mb={4}>
          <Text size="sm" fw={500}>
            Zoom
          </Text>
          <Text size="sm" c="dimmed">
            {Math.round(zoom * 100)}%
          </Text>
        </Group>
        <Slider
          value={zoom}
          onChange={onZoomChange}
          min={0.5}
          max={2}
          step={0.1}
          marks={[
            { value: 0.5, label: "50%" },
            { value: 1, label: "100%" },
            { value: 1.5, label: "150%" },
            { value: 2, label: "200%" },
          ]}
          disabled={disabled}
          color="accent"
        />
      </div>

      <div>
        <Group justify="space-between" mb={4}>
          <Text size="sm" fw={500}>
            Rotasi
          </Text>
          <Text size="sm" c="dimmed">
            {rotation}°
          </Text>
        </Group>
        <Slider
          value={rotation}
          onChange={onRotationChange}
          min={-45}
          max={45}
          step={5}
          marks={[
            { value: -45, label: "-45°" },
            { value: 0, label: "0°" },
            { value: 45, label: "45°" },
          ]}
          disabled={disabled}
          color="accent"
        />
      </div>

      <Group gap={8}>
        <Button
          variant="light"
          size="compact-sm"
          onClick={() => onRotationChange(-15)}
          disabled={disabled}
        >
          -15°
        </Button>
        <Button
          variant="light"
          size="compact-sm"
          onClick={() => onRotationChange(0)}
          disabled={disabled}
        >
          0°
        </Button>
        <Button
          variant="light"
          size="compact-sm"
          onClick={() => onRotationChange(15)}
          disabled={disabled}
        >
          15°
        </Button>
      </Group>

      <Button
        variant="subtle"
        color="gray"
        leftSection={<IconRotate size={16} />}
        onClick={onReset}
        disabled={disabled}
      >
        Reset Position
      </Button>
    </Stack>
  );
}
