"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconEdit,
  IconExternalLink,
  IconLayoutDashboard,
  IconPlus,
  IconPhoto,
  IconTrash,
  IconBook,
  IconX,
} from "@tabler/icons-react";
import { agenda as defaultAgenda } from "@/data/agenda";
import { frames as defaultFrames } from "@/data/frames";
import type { AgendaItem, Frame } from "@/types";

type GuideSection = { title: string; items: string[] };
type View = "overview" | "frames" | "agenda" | "guide";

const defaultGuide: GuideSection[] = [
  {
    title: "Sebelum PKKMB",
    items: [
      "Persiapkan identitas mahasiswa",
      "Siapkan perangkat (laptop/smartphone)",
      "Download dokumen yang diperlukan",
      "Gunakan Twibbon PKKMB",
      "Periksa jadwal dan lokasi",
    ],
  },
  {
    title: "Saat PKKMB",
    items: [
      "Hadir tepat waktu",
      "Ikuti instruksi panitia",
      "Gunakan atribut sesuai ketentuan",
      "Jaga kesehatan dan stamina",
      "Aktif dalam setiap kegiatan",
    ],
  },
];

const facultyOptions = [
  { value: "all", label: "Semua mahasiswa" },
  { value: "fst", label: "Sains & Teknologi" },
  { value: "fisbis", label: "Ilmu Sosial & Bisnis" },
  { value: "pasca", label: "Pascasarjana" },
];

const statusOptions = [
  { value: "upcoming", label: "Akan datang" },
  { value: "today", label: "Hari ini" },
  { value: "completed", label: "Selesai" },
];

const emptyFrame: Frame = {
  id: "",
  name: "",
  faculty: "all",
  image: "/frames/",
};

const emptyAgenda: AgendaItem = {
  id: "",
  tanggal: "",
  waktu: "08:00",
  kegiatan: "",
  lokasi: "",
  status: "upcoming",
  catatan: "",
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="sm" c="dimmed" fw={500}>{label}</Text>
          <Text size="2rem" fw={700} c="navy.7" mt={4}>{value}</Text>
        </div>
        <div style={{ background: color, color: "#0A192F", borderRadius: 10, padding: 10 }}>
          {icon}
        </div>
      </Group>
    </Card>
  );
}

export default function AdminPage({ initialView = "overview" }: { initialView?: View }) {
  const [activeView, setActiveView] = useState<View>(initialView);
  const [frames, setFrames] = useState<Frame[]>(defaultFrames);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(defaultAgenda);
  const [guide, setGuide] = useState<GuideSection[]>(defaultGuide);
  const [frameModal, setFrameModal] = useState(false);
  const [agendaModal, setAgendaModal] = useState(false);
  const [guideModal, setGuideModal] = useState(false);
  const [editingFrame, setEditingFrame] = useState<Frame | null>(null);
  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null);
  const [editingGuide, setEditingGuide] = useState<GuideSection | null>(null);
  const [editingGuideOriginalTitle, setEditingGuideOriginalTitle] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  useEffect(() => {
    setFrames(readStorage("pkkmb-admin-frames", defaultFrames));
    setAgendaItems(readStorage("pkkmb-admin-agenda", defaultAgenda));
    setGuide(readStorage("pkkmb-admin-guide", defaultGuide));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("pkkmb-admin-frames", JSON.stringify(frames));
    window.localStorage.setItem("pkkmb-admin-agenda", JSON.stringify(agendaItems));
    window.localStorage.setItem("pkkmb-admin-guide", JSON.stringify(guide));
  }, [agendaItems, frames, guide, hydrated]);

  const upcomingCount = useMemo(
    () => agendaItems.filter((item) => item.status === "upcoming").length,
    [agendaItems]
  );

  const openFrame = (frame?: Frame) => {
    setEditingFrame(frame ? { ...frame } : { ...emptyFrame, id: `frame-${Date.now()}` });
    setFrameModal(true);
  };

  const saveFrame = () => {
    if (!editingFrame?.name.trim() || !editingFrame.image.trim()) return;
    setFrames((current) => {
      const exists = current.some((frame) => frame.id === editingFrame.id);
      return exists ? current.map((frame) => frame.id === editingFrame.id ? editingFrame : frame) : [...current, editingFrame];
    });
    setFrameModal(false);
  };

  const deleteFrame = (id: string) => {
    if (window.confirm("Hapus frame ini dari dashboard?")) {
      setFrames((current) => current.filter((frame) => frame.id !== id));
    }
  };

  const openAgenda = (item?: AgendaItem) => {
    setEditingAgenda(item ? { ...item } : { ...emptyAgenda, id: `agenda-${Date.now()}` });
    setAgendaModal(true);
  };

  const saveAgenda = () => {
    if (!editingAgenda?.kegiatan.trim() || !editingAgenda.tanggal.trim()) return;
    setAgendaItems((current) => {
      const exists = current.some((item) => item.id === editingAgenda.id);
      return exists ? current.map((item) => item.id === editingAgenda.id ? editingAgenda : item) : [...current, editingAgenda];
    });
    setAgendaModal(false);
  };

  const deleteAgenda = (id: string) => {
    if (window.confirm("Hapus agenda ini dari dashboard?")) {
      setAgendaItems((current) => current.filter((item) => item.id !== id));
    }
  };

  const openGuide = (section?: GuideSection) => {
    setEditingGuide(section ? { ...section, items: [...section.items] } : { title: "", items: [""] });
    setEditingGuideOriginalTitle(section?.title || null);
    setGuideModal(true);
  };

  const saveGuide = () => {
    if (!editingGuide?.title.trim()) return;
    const cleanGuide = { ...editingGuide, items: editingGuide.items.filter((item) => item.trim()) };
    setGuide((current) => editingGuideOriginalTitle
      ? current.map((section) => section.title === editingGuideOriginalTitle ? cleanGuide : section)
      : [...current, cleanGuide]);
    setGuideModal(false);
  };

  const deleteGuide = (title: string) => {
    if (window.confirm("Hapus bagian panduan ini?")) setGuide((current) => current.filter((section) => section.title !== title));
  };

  const menu = [
    { value: "overview" as View, label: "Ringkasan", icon: <IconLayoutDashboard size={18} /> },
    { value: "frames" as View, label: "Frame twibbon", icon: <IconPhoto size={18} />, count: frames.length },
    { value: "agenda" as View, label: "Agenda", icon: <IconCalendarEvent size={18} />, count: agendaItems.length },
    { value: "guide" as View, label: "Panduan", icon: <IconBook size={18} />, count: guide.length },
  ];

  return (
    <div style={{ background: "#F7F8FC", minHeight: "calc(100vh - 64px)" }}>
      <Container size="xl" py={{ base: 24, md: 40 }}>
        <Group justify="space-between" align="flex-end" mb={28}>
          <div>
            <Text size="sm" fw={700} c="accent" tt="uppercase" style={{ letterSpacing: "0.1em" }}>Panel kontrol</Text>
            <Title order={1} size="h2" c="navy.7" mt={6}>Admin dashboard</Title>
            <Text c="dimmed" mt={8}>Kelola konten PKKMB IWU dari satu tempat.</Text>
          </div>
          <Button component="a" href="/" variant="subtle" color="navy" leftSection={<IconExternalLink size={16} />}>Lihat situs</Button>
        </Group>

        <Paper withBorder radius="md" p={6} mb={24} style={{ background: "white" }}>
          <Group gap={4} wrap="wrap">
            {menu.map((item) => (
              <Button
                key={item.value}
                variant={activeView === item.value ? "filled" : "subtle"}
                color={activeView === item.value ? "navy" : "gray"}
                leftSection={item.icon}
                onClick={() => setActiveView(item.value)}
                rightSection={item.count !== undefined ? <Badge size="sm" variant="light" color={activeView === item.value ? "gray" : "navy"}>{item.count}</Badge> : undefined}
              >
                {item.label}
              </Button>
            ))}
          </Group>
        </Paper>

        {activeView === "overview" && (
          <Stack gap={24}>
            <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
              <StatCard label="Total frame" value={frames.length} icon={<IconPhoto size={22} />} color="#E6F3FF" />
              <StatCard label="Total agenda" value={agendaItems.length} icon={<IconCalendarEvent size={22} />} color="#FFF2CF" />
              <StatCard label="Agenda aktif" value={upcomingCount} icon={<IconClock size={22} />} color="#E5F6ED" />
              <StatCard label="Bagian panduan" value={guide.length} icon={<IconBook size={22} />} color="#F2E9FF" />
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <Card withBorder radius="md" p="xl">
                <Group justify="space-between" mb="md"><div><Title order={3} c="navy.7">Agenda terdekat</Title><Text size="sm" c="dimmed" mt={4}>Konten yang tampil di halaman publik.</Text></div><IconCalendarEvent color="#D4AF37" /></Group>
                <Stack gap="sm">
                  {agendaItems.slice(0, 4).map((item) => <Group key={item.id} justify="space-between"><div><Text size="sm" fw={600} c="navy.7">{item.kegiatan}</Text><Text size="xs" c="dimmed">{item.tanggal} · {item.waktu} · {item.lokasi}</Text></div><Badge color={item.status === "completed" ? "gray" : item.status === "today" ? "orange" : "green"} variant="light">{statusOptions.find((option) => option.value === item.status)?.label}</Badge></Group>)}
                </Stack>
              </Card>
              <Card withBorder radius="md" p="xl">
                <Group justify="space-between" mb="md"><div><Title order={3} c="navy.7">Aksi cepat</Title><Text size="sm" c="dimmed" mt={4}>Tambahkan konten tanpa berpindah halaman.</Text></div><IconPlus color="#7C3AED" /></Group>
                <Stack gap="sm"><Button variant="light" color="accent" leftSection={<IconPhoto size={17} />} onClick={() => { setActiveView("frames"); openFrame(); }}>Tambah frame baru</Button><Button variant="light" color="navy" leftSection={<IconCalendarEvent size={17} />} onClick={() => { setActiveView("agenda"); openAgenda(); }}>Tambah agenda baru</Button><Button variant="light" color="yellow" leftSection={<IconBook size={17} />} onClick={() => { setActiveView("guide"); openGuide(); }}>Tambah panduan baru</Button></Stack>
              </Card>
            </SimpleGrid>
          </Stack>
        )}

        {activeView === "frames" && <FrameManager frames={frames} onAdd={() => openFrame()} onEdit={openFrame} onDelete={deleteFrame} />}
        {activeView === "agenda" && <AgendaManager items={agendaItems} onAdd={() => openAgenda()} onEdit={openAgenda} onDelete={deleteAgenda} />}
        {activeView === "guide" && <GuideManager guide={guide} onAdd={() => openGuide()} onEdit={openGuide} onDelete={deleteGuide} />}
      </Container>

      <Modal opened={frameModal} onClose={() => setFrameModal(false)} title={<Title order={3}>Frame twibbon</Title>} centered>
        <Stack>
          <TextInput label="Nama frame" placeholder="PKKMB 2026" value={editingFrame?.name || ""} onChange={(event) => { const value = event.currentTarget.value; setEditingFrame((current) => current ? { ...current, name: value } : current); }} required />
          <Select label="Target fakultas" data={facultyOptions} value={editingFrame?.faculty || "all"} onChange={(value) => setEditingFrame((current) => current ? { ...current, faculty: (value || "all") as Frame["faculty"] } : current)} />
          <TextInput label="Path gambar" placeholder="/frames/nama-frame.svg" value={editingFrame?.image || ""} onChange={(event) => { const value = event.currentTarget.value; setEditingFrame((current) => current ? { ...current, image: value } : current); }} description="Gunakan file yang tersedia di folder public/frames." required />
          <Group justify="flex-end" mt="md"><Button variant="default" onClick={() => setFrameModal(false)}>Batal</Button><Button color="navy" onClick={saveFrame}>Simpan frame</Button></Group>
        </Stack>
      </Modal>

      <Modal opened={agendaModal} onClose={() => setAgendaModal(false)} title={<Title order={3}>Agenda kegiatan</Title>} centered>
        <Stack>
          <TextInput label="Nama kegiatan" placeholder="Opening PKKMB" value={editingAgenda?.kegiatan || ""} onChange={(event) => { const value = event.currentTarget.value; setEditingAgenda((current) => current ? { ...current, kegiatan: value } : current); }} required />
          <Group grow><TextInput label="Tanggal" placeholder="08 SEP" value={editingAgenda?.tanggal || ""} onChange={(event) => { const value = event.currentTarget.value; setEditingAgenda((current) => current ? { ...current, tanggal: value } : current); }} required /><TextInput label="Waktu" type="time" value={editingAgenda?.waktu || ""} onChange={(event) => { const value = event.currentTarget.value; setEditingAgenda((current) => current ? { ...current, waktu: value } : current); }} /></Group>
          <TextInput label="Lokasi" placeholder="Auditorium" value={editingAgenda?.lokasi || ""} onChange={(event) => { const value = event.currentTarget.value; setEditingAgenda((current) => current ? { ...current, lokasi: value } : current); }} />
          <Select label="Status" data={statusOptions} value={editingAgenda?.status || "upcoming"} onChange={(value) => setEditingAgenda((current) => current ? { ...current, status: (value || "upcoming") as AgendaItem["status"] } : current)} />
          <Textarea label="Catatan" placeholder="Informasi tambahan untuk mahasiswa" minRows={3} value={editingAgenda?.catatan || ""} onChange={(event) => { const value = event.currentTarget.value; setEditingAgenda((current) => current ? { ...current, catatan: value } : current); }} />
          <Group justify="flex-end" mt="md"><Button variant="default" onClick={() => setAgendaModal(false)}>Batal</Button><Button color="navy" onClick={saveAgenda}>Simpan agenda</Button></Group>
        </Stack>
      </Modal>

      <Modal opened={guideModal} onClose={() => setGuideModal(false)} title={<Title order={3}>Bagian panduan</Title>} centered>
        <Stack>
          <TextInput label="Judul bagian" placeholder="Sebelum PKKMB" value={editingGuide?.title || ""} onChange={(event) => { const value = event.currentTarget.value; setEditingGuide((current) => current ? { ...current, title: value } : current); }} required />
          <Text size="sm" fw={500}>Checklist panduan</Text>
          {editingGuide?.items.map((item, index) => <Group key={`${index}-${item}`} align="flex-end"><TextInput style={{ flex: 1 }} placeholder="Poin panduan" value={item} onChange={(event) => { const value = event.currentTarget.value; setEditingGuide((current) => current ? { ...current, items: current.items.map((itemValue, itemIndex) => itemIndex === index ? value : itemValue) } : current); }} /><ActionIcon aria-label="Hapus poin" color="red" variant="subtle" onClick={() => setEditingGuide((current) => current ? { ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) } : current)}><IconX size={16} /></ActionIcon></Group>)}
          <Button variant="light" leftSection={<IconPlus size={16} />} onClick={() => setEditingGuide((current) => current ? { ...current, items: [...current.items, ""] } : current)}>Tambah poin</Button>
          <Group justify="flex-end" mt="md"><Button variant="default" onClick={() => setGuideModal(false)}>Batal</Button><Button color="navy" onClick={saveGuide}>Simpan panduan</Button></Group>
        </Stack>
      </Modal>
    </div>
  );
}

function PageHeader({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return <Group justify="space-between" align="flex-end" mb={16} wrap="wrap"><div><Title order={2} c="navy.7">{title}</Title><Text size="sm" c="dimmed" mt={4}>{description}</Text></div>{action}</Group>;
}

function FrameManager({ frames, onAdd, onEdit, onDelete }: { frames: Frame[]; onAdd: () => void; onEdit: (frame: Frame) => void; onDelete: (id: string) => void }) {
  return <><PageHeader title="Frame twibbon" description="Kelola frame yang tersedia di studio." action={<Button color="navy" leftSection={<IconPlus size={16} />} onClick={onAdd}>Tambah frame</Button>} /><Paper withBorder radius="md" style={{ overflow: "hidden" }}><ScrollArea><Table highlightOnHover miw={650}><Table.Thead><Table.Tr><Table.Th>Frame</Table.Th><Table.Th>Target</Table.Th><Table.Th>Path aset</Table.Th><Table.Th ta="right">Aksi</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{frames.map((frame) => <Table.Tr key={frame.id}><Table.Td><Group gap="sm"><div style={{ width: 42, height: 42, borderRadius: 8, background: "#F1F5F9", display: "grid", placeItems: "center" }}><IconPhoto size={18} color="#7C3AED" /></div><div><Text size="sm" fw={600}>{frame.name}</Text><Text size="xs" c="dimmed">{frame.id}</Text></div></Group></Table.Td><Table.Td><Badge variant="light" color="navy">{facultyOptions.find((option) => option.value === frame.faculty)?.label}</Badge></Table.Td><Table.Td><Text size="sm" c="dimmed">{frame.image}</Text></Table.Td><Table.Td><Group justify="flex-end" gap={4}><ActionIcon aria-label={`Edit ${frame.name}`} variant="subtle" color="navy" onClick={() => onEdit(frame)}><IconEdit size={17} /></ActionIcon><ActionIcon aria-label={`Hapus ${frame.name}`} variant="subtle" color="red" onClick={() => onDelete(frame.id)}><IconTrash size={17} /></ActionIcon></Group></Table.Td></Table.Tr>)}</Table.Tbody></Table></ScrollArea></Paper></>;
}

function AgendaManager({ items, onAdd, onEdit, onDelete }: { items: AgendaItem[]; onAdd: () => void; onEdit: (item: AgendaItem) => void; onDelete: (id: string) => void }) {
  return <><PageHeader title="Agenda kegiatan" description="Atur jadwal, lokasi, dan catatan kegiatan." action={<Button color="navy" leftSection={<IconPlus size={16} />} onClick={onAdd}>Tambah agenda</Button>} /><Paper withBorder radius="md" style={{ overflow: "hidden" }}><ScrollArea><Table highlightOnHover miw={760}><Table.Thead><Table.Tr><Table.Th>Waktu</Table.Th><Table.Th>Kegiatan</Table.Th><Table.Th>Lokasi</Table.Th><Table.Th>Status</Table.Th><Table.Th ta="right">Aksi</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{items.map((item) => <Table.Tr key={item.id}><Table.Td><Text size="sm" fw={600}>{item.tanggal}</Text><Text size="xs" c="dimmed">{item.waktu}</Text></Table.Td><Table.Td><Text size="sm" fw={600}>{item.kegiatan}</Text><Text size="xs" c="dimmed">{item.catatan || "Tanpa catatan"}</Text></Table.Td><Table.Td><Text size="sm">{item.lokasi || "-"}</Text></Table.Td><Table.Td><Badge variant="light" color={item.status === "completed" ? "gray" : item.status === "today" ? "orange" : "green"}>{statusOptions.find((option) => option.value === item.status)?.label}</Badge></Table.Td><Table.Td><Group justify="flex-end" gap={4}><ActionIcon aria-label={`Edit ${item.kegiatan}`} variant="subtle" color="navy" onClick={() => onEdit(item)}><IconEdit size={17} /></ActionIcon><ActionIcon aria-label={`Hapus ${item.kegiatan}`} variant="subtle" color="red" onClick={() => onDelete(item.id)}><IconTrash size={17} /></ActionIcon></Group></Table.Td></Table.Tr>)}</Table.Tbody></Table></ScrollArea></Paper></>;
}

function GuideManager({ guide, onAdd, onEdit, onDelete }: { guide: GuideSection[]; onAdd: () => void; onEdit: (section: GuideSection) => void; onDelete: (title: string) => void }) {
  return <><PageHeader title="Panduan PKKMB" description="Kelola checklist yang membantu mahasiswa bersiap." action={<Button color="navy" leftSection={<IconPlus size={16} />} onClick={onAdd}>Tambah bagian</Button>} /><SimpleGrid cols={{ base: 1, md: 2 }}>{guide.map((section) => <Card key={section.title} withBorder radius="md" p="xl"><Group justify="space-between" align="flex-start"><div><Title order={3} size="h4" c="navy.7">{section.title}</Title><Text size="sm" c="dimmed" mt={4}>{section.items.length} poin checklist</Text></div><Group gap={4}><ActionIcon aria-label={`Edit ${section.title}`} variant="subtle" color="navy" onClick={() => onEdit(section)}><IconEdit size={17} /></ActionIcon><ActionIcon aria-label={`Hapus ${section.title}`} variant="subtle" color="red" onClick={() => onDelete(section.title)}><IconTrash size={17} /></ActionIcon></Group></Group><Divider my="md" /><Stack gap="xs">{section.items.map((item) => <Group key={item} gap="xs" align="flex-start"><IconCheck size={16} color="#2F9E44" style={{ marginTop: 3 }} /><Text size="sm">{item}</Text></Group>)}</Stack></Card>)}</SimpleGrid></>;
}