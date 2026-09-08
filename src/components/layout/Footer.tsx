import Link from "next/link";
import Image from "next/image";
import { Container, Group, Text, Anchor, Stack, Divider } from "@mantine/core";

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#0A192F",
        color: "white",
      }}
    >
      <Container size="xl" py={48}>
        <Group justify="space-between" wrap="wrap" gap={32}>
          <div>
            <Group gap={12} mb={12}>
              <Image
                src="/images/logo-iwu-fav-footer.jpeg"
                alt="IWU Logo"
                width={40}
                height={40}
                style={{ borderRadius: "8px", objectFit: "cover" }}
              />
              <div>
                <Text fw={600} size="lg">
                  International Women University
                </Text>
                <Text size="sm" c="gray.3">
                  PKKMB 2026
                </Text>
              </div>
            </Group>
            <Text size="sm" c="gray.3">
              Bandung, Indonesia
            </Text>
          </div>

          <Group gap={24}>
            <Anchor
              href="https://www.iwu.ac.id"
              target="_blank"
              c="gray.3"
              size="sm"
              style={{ textDecoration: "none" }}
            >
              Website
            </Anchor>
            <Anchor
              href="https://www.instagram.com/iwanrwomenuniversity"
              target="_blank"
              c="gray.3"
              size="sm"
              style={{ textDecoration: "none" }}
            >
              Instagram
            </Anchor>
            <Link href="/agenda" style={{ textDecoration: "none" }}>
              <Text size="sm" c="gray.3">
                Contact Panitia
              </Text>
            </Link>
          </Group>
        </Group>

        <Divider color="gray.7" my={24} />

        <Group justify="space-between" wrap="wrap" gap={16}>
          <Text size="xs" c="gray.4">
            &copy; 2026 International Women University
          </Text>

          <Group gap={16} align="center">
            <Text size="xs" c="gray.4">
              Dikembangkan oleh:
            </Text>
            <Image
              src="/images/logo-hima.png"
              alt="HIMA Logo"
              width={24}
              height={24}
              style={{ borderRadius: "4px", objectFit: "cover" }}
            />
            <Image
              src="/images/logo-kabinet-synapse.png"
              alt="Kabinet Synapse Logo"
              width={24}
              height={24}
              style={{ borderRadius: "4px", objectFit: "cover" }}
            />
          </Group>
        </Group>
      </Container>
    </footer>
  );
}
