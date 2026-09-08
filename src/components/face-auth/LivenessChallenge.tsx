'use client';

// ─────────────────────────────────────────────────────────────────────────────
// LivenessChallenge
// Menampilkan challenge satu per satu + progress dots.
// Logic deteksi ada di parent (FaceVerification / FaceEnrollment).
// ─────────────────────────────────────────────────────────────────────────────

import { Stack, Text, Group, Progress, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import type { LivenessChallenge as LivenessChallengeType } from '@/types/face-auth';
import { challengeInstruction, challengeIcon } from '@/lib/face/liveness';

interface LivenessChallengeProps {
  challenges: LivenessChallengeType[];
  currentIndex: number;
  passedCount: number;
  timeoutMs: number;
  elapsedMs: number;
}

export function LivenessChallenge({
  challenges,
  currentIndex,
  passedCount,
  timeoutMs,
  elapsedMs,
}: LivenessChallengeProps) {
  const current = challenges[currentIndex];
  if (!current) return null;

  const progressPercent = Math.min(100, (elapsedMs / timeoutMs) * 100);
  const isWarning = progressPercent > 70;

  return (
    <Stack gap={12}>
      {/* Challenge instruction */}
      <div
        style={{
          backgroundColor: '#0F2042',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 10,
          padding: '14px 18px',
          textAlign: 'center',
        }}
      >
        <Text size="xl" mb={4} aria-hidden="true">
          {challengeIcon(current)}
        </Text>
        <Text size="sm" fw={500} c="white">
          {challengeInstruction(current)}
        </Text>
      </div>

      {/* Timeout progress bar */}
      <div>
        <Progress
          value={100 - progressPercent}
          color={isWarning ? 'orange' : 'yellow'}
          size="xs"
          radius="xl"
          aria-label={`Sisa waktu challenge`}
        />
      </div>

      {/* Challenge progress dots */}
      <Group justify="center" gap={8}>
        {challenges.map((c, i) => (
          <ThemeIcon
            key={i}
            size={28}
            radius="xl"
            color={
              i < passedCount
                ? 'teal'
                : i === currentIndex
                ? 'yellow'
                : 'dark'
            }
            variant={i <= currentIndex ? 'filled' : 'light'}
            aria-label={
              i < passedCount
                ? `Challenge ${i + 1} selesai`
                : i === currentIndex
                ? `Challenge ${i + 1} aktif`
                : `Challenge ${i + 1} belum`
            }
          >
            {i < passedCount ? (
              <IconCheck size={14} />
            ) : (
              <Text size="xs" fw={700} c="white">
                {i + 1}
              </Text>
            )}
          </ThemeIcon>
        ))}
      </Group>
    </Stack>
  );
}
