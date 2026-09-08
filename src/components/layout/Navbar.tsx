"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Container,
  Group,
  Button,
  Burger,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/studio", label: "Studio" },
  { href: "/agenda", label: "Agenda" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: scrolled ? "rgba(255,255,255,0.95)" : "white",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: scrolled ? "1px solid #E2E8F0" : "1px solid transparent",
        transition: "all 0.2s ease",
      }}
    >
      <Container size="xl">
        <Group justify="space-between" h={64}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Group gap={10}>
              <Image
                src="/images/logo-iwu.png"
                alt="IWU Logo"
                width={36}
                height={36}
                style={{ borderRadius: "8px", objectFit: "cover" }}
              />
              <div style={{ lineHeight: 1.2 }}>
                <Text fw={700} size="sm" c="navy.7">
                  PKKMB 2026
                </Text>
                <Text size="xs" c="dimmed">
                  IWU
                </Text>
              </div>
            </Group>
          </Link>

          <Group gap={32} visibleFrom="md">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: pathname === link.href ? "#7C3AED" : "#1F2937",
                  transition: "color 0.2s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </Group>

          <Group gap={16} visibleFrom="md">
            <Link href="/studio" style={{ textDecoration: "none" }}>
              <Button variant="outline" color="navy.7">
                Buat Twibbon
              </Button>
            </Link>
          </Group>

          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="md"
            size="sm"
          />
        </Group>
      </Container>

      {opened && (
        <Paper
          shadow="md"
          p="md"
          hiddenFrom="md"
          style={{ position: "absolute", top: 64, left: 0, right: 0, zIndex: 50 }}
        >
          <Stack gap={8}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                style={{
                  textDecoration: "none",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: pathname === link.href ? "#7C3AED" : "#1F2937",
                  backgroundColor: pathname === link.href ? "#F5F0FF" : "transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/studio" onClick={close} style={{ textDecoration: "none" }}>
              <Button fullWidth variant="outline" color="navy.7">
                Buat Twibbon
              </Button>
            </Link>
          </Stack>
        </Paper>
      )}
    </header>
  );
}
