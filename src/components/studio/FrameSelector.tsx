"use client";

import { Frame } from "@/types";
import { Text, Paper, SimpleGrid } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

interface FrameSelectorProps {
  frames: Frame[];
  selectedFrame: Frame | null;
  onSelect: (frame: Frame) => void;
}

export function FrameSelector({
  frames,
  selectedFrame,
  onSelect,
}: FrameSelectorProps) {
  return (
    <SimpleGrid cols={2} spacing={10}>
      {frames.map((frame) => (
        <Paper
          key={frame.id}
          p={6}
          withBorder
          radius="md"
          onClick={() => onSelect(frame)}
          style={{
            cursor: "pointer",
            borderColor: selectedFrame?.id === frame.id ? "#7C3AED" : "#E2E8F0",
            backgroundColor: selectedFrame?.id === frame.id ? "#F5F0FF" : "white",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "6px",
              backgroundColor: "#F8FAFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Text size="xs" fw={500} ta="center" c="navy.7" px={4}>
              {frame.name}
            </Text>
            {selectedFrame?.id === frame.id && (
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  backgroundColor: "#7C3AED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCheck size={10} color="white" />
              </div>
            )}
          </div>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
