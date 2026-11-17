export interface ActionItem {
  id: string;
  description: string;
  assignee: string | null;
  due_date: string | null;
  is_done: boolean;
}

export interface KeyDecision {
  id: string;
  description: string;
}

export interface Meeting {
  id: string;
  title: string;
  status: "processing" | "transcribed" | "done" | "error";
  summary: string | null;
  raw_transcript: string | null;
  language?: string;
  meeting_date?: string;
  created_at: string;
  action_items: ActionItem[];
  key_decisions: KeyDecision[];
}

const STORAGE_KEY = "meetmind_demo_meetings";

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: "demo-meeting-1",
    title: "Q4 Product Strategy & AI Integration",
    status: "done",
    summary:
      "Tim Product dan Engineering menyepakati integrasi AI meeting summarizer untuk kuartal ke-4 guna meningkatkan retensi pengguna sebesar 35%. Rilis beta publik ditargetkan meluncur pada pertengahan November 2026, dengan fokus utama pada pemrosesan audio berlatensi rendah serta fitur ekspor laporan ringkas.",
    raw_transcript:
      "Sarah (CPO): Selamat pagi rekan-rekan. Agenda utama kita pagi ini adalah finalisasi roadmap Q4, khususnya peluncuran fitur AI Summary pada MeetMind.\nBudi (Tech Lead): Dari sisi backend, pipeline transkripsi Whisper dan Groq LLaMA 3.1 sudah terintegrasi. Latensi ringkasan untuk audio 30 menit kini bisa diselesaikan di bawah 3 detik.\nRina (Product Design): Dari sisi UI/UX, kami telah menguji layout transkrip interaktif dan panel Action Items. Respon pengguna awal menunjukkan peningkatan navigasi sebesar 40%.\nSarah (CPO): Bagus sekali. Target kita adalah meluncurkan versi beta pada 15 November 2026. Budi, tolong pastikan deployment staging siap minggu ini.\nBudi (Tech Lead): Siap, staging deployment akan saya selesaikan tanggal 20 November.\nRina (Product Design): Saya akan menyusun survey feedback untuk user beta paling lambat tanggal 25 November.\nSarah (CPO): Baik, terima kasih semuanya. Kita tutup meeting hari ini.",
    created_at: "2026-11-15T09:30:00.000Z",
    action_items: [
      {
        id: "act-1",
        description: "Deploy release candidate v1.2 ke staging server",
        assignee: "Budi",
        due_date: "2026-11-20",
        is_done: true,
      },
      {
        id: "act-2",
        description: "Finalisasi user feedback survey untuk program beta tester",
        assignee: "Rina",
        due_date: "2026-11-25",
        is_done: false,
      },
      {
        id: "act-3",
        description: "Siapkan dokumentasi API publik untuk integrasi partner",
        assignee: "Sarah",
        due_date: "2026-11-30",
        is_done: false,
      },
    ],
    key_decisions: [
      {
        id: "kd-1",
        description: "Peluncuran beta publik ditetapkan pada 15 November 2026.",
      },
      {
        id: "kd-2",
        description:
          "Format ekspor standar mencakup PDF dan plain text dengan highlight action items.",
      },
    ],
  },
  {
    id: "demo-meeting-2",
    title: "Weekly Engineering Standup & Sprint Planning #14",
    status: "done",
    summary:
      "Sprint 14 berfokus pada stabilitas sistem, optimasi connection pool database, dan peningkatan code coverage pengujian otomatis. Tim menargetkan total 18 story points untuk diselesaikan dalam sprint dua pekan ini.",
    raw_transcript:
      "Agus (Lead Dev): Halo semuanya, mari kita mulai sprint planning 14. Dewi, bagaimana perkembangan database PostgreSQL?\nDewi (Backend Dev): Query index sudah dioptimasi, namun connection pool masih perlu di-refactor agar siap menangani konkurensi di atas 500 req/sec saat jam sibuk.\nFajar (QA & Test): Saya sudah menyiapkan skenario unit test untuk endpoint summarize dan export. Target kita menaikkan code coverage di atas 80%.\nAgus (Lead Dev): Bagus, prioritaskan refactor connection pool sebelum kita menambahkan fitur websocket baru.\nDewi (Backend Dev): Baik, target selesai 22 November.\nFajar (QA & Test): Unit test endpoint saya jadwalkan selesai 24 November.",
    created_at: "2026-11-12T14:00:00.000Z",
    action_items: [
      {
        id: "act-4",
        description: "Refactor connection pooling database untuk beban konkurensi tinggi",
        assignee: "Dewi",
        due_date: "2026-11-22",
        is_done: true,
      },
      {
        id: "act-5",
        description: "Implementasi unit test untuk endpoint summarize & extract",
        assignee: "Fajar",
        due_date: "2026-11-24",
        is_done: true,
      },
      {
        id: "act-6",
        description: "Setup dashboard monitoring performa server",
        assignee: "Agus",
        due_date: "2026-11-28",
        is_done: false,
      },
    ],
    key_decisions: [
      {
        id: "kd-3",
        description: "Refactor database connection pooling diprioritaskan sebelum penambahan fitur baru.",
      },
      {
        id: "kd-4",
        description: "Standar code coverage dinaikkan menjadi minimal 80% sebelum merge ke branch main.",
      },
    ],
  },
  {
    id: "demo-meeting-3",
    title: "Client Kickoff - Enterprise Workspace Integration",
    status: "done",
    summary:
      "Pertemuan inisiasi dengan klien enterprise untuk mengintegrasikan MeetMind ke 500 pengguna aktif kantor pusat. Klien menekankan kepatuhan enkripsi data end-to-end serta kustomisasi Single Sign-On (SSO). Disepakati masa uji coba pilot selama 30 hari untuk 50 user terpilih.",
    raw_transcript:
      "Klien (Head of IT): Terima kasih atas presentasinya. Kami sangat tertarik mengadopsi MeetMind untuk merangkum rapat pimpinan mingguan kami. Fokus regulasi kami adalah enkripsi data dan kepatuhan privasi karyawan.\nSarah (CPO): Tentu, arsitektur MeetMind mendukung enkripsi data resting & in-transit. Kami juga dapat menyetel retensi penghapusan otomatis setelah transkrip dirangkum.\nKlien (Head of IT): Itu luar biasa. Kami sepakat memulai program pilot 30 hari untuk divisi Produk dan Engineering kami.\nBudi (Tech Lead): Kami akan siapkan environment SSO staging dan mengirimkan checklist audit kepatuhan keamanan dalam minggu ini.",
    created_at: "2026-11-08T10:15:00.000Z",
    action_items: [
      {
        id: "act-7",
        description: "Kirim dokumen Security & Privacy Compliance Checklist ke tim Legal klien",
        assignee: "Sarah",
        due_date: "2026-11-21",
        is_done: false,
      },
      {
        id: "act-8",
        description: "Jadwalkan technical discovery session dengan tim IT klien",
        assignee: "Budi",
        due_date: "2026-11-26",
        is_done: false,
      },
    ],
    key_decisions: [
      {
        id: "kd-5",
        description: "Program pilot 30 hari disetujui untuk 50 pengguna awal di divisi Produk & IT klien.",
      },
    ],
  },
];

export function getStoredMeetings(): Meeting[] {
  if (typeof window === "undefined") return INITIAL_MEETINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEETINGS));
      return INITIAL_MEETINGS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEETINGS));
      return INITIAL_MEETINGS;
    }
    return parsed;
  } catch {
    return INITIAL_MEETINGS;
  }
}

export function saveStoredMeetings(meetings: Meeting[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
  } catch (err) {
    console.error("Failed to save meetings:", err);
  }
}

export function getMeetingById(id: string): Meeting | null {
  const meetings = getStoredMeetings();
  return meetings.find((m) => m.id === id) || null;
}

export function upsertMeeting(meeting: Meeting): void {
  const meetings = getStoredMeetings();
  const idx = meetings.findIndex((m) => m.id === meeting.id);
  if (idx >= 0) {
    meetings[idx] = meeting;
  } else {
    meetings.unshift(meeting);
  }
  saveStoredMeetings(meetings);
}

export function deleteStoredMeeting(id: string): void {
  const meetings = getStoredMeetings();
  const filtered = meetings.filter((m) => m.id !== id);
  saveStoredMeetings(filtered);
}

export function resetDemoMeetings(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEETINGS));
}
