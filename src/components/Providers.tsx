"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";

const theme = createTheme({
  primaryColor: "navy",
  colors: {
    navy: [
      "#E8EBF0",
      "#C5CBD6",
      "#9BA5B8",
      "#6F7D99",
      "#4D5D80",
      "#2E4067",
      "#1A2D50",
      "#0F2042",
      "#0A192F",
      "#060F1D",
    ],
    accent: [
      "#F5F0FF",
      "#E8DBFF",
      "#D0B8FF",
      "#B794FF",
      "#9F70FF",
      "#864CFF",
      "#7C3AED",
      "#6529CC",
      "#4E19AB",
      "#380A8A",
    ],
    dimmed: [
      "#F8F9FA",
      "#F1F3F5",
      "#E9ECEF",
      "#DEE2E6",
      "#CED4DA",
      "#ADB5BD",
      "#495057",
      "#343A40",
      "#212529",
      "#111827",
    ],
  },
  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
  defaultRadius: "md",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
