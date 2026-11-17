"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import NavbarApp from "@/components/NavbarApp";
import StatusBadge from "@/components/StatusBadge";
import { FileText, Plus, Filter, ArrowUpDown, Sparkles, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  getStoredMeetings,
  deleteStoredMeeting,
  resetDemoMeetings,
  Meeting,
} from "@/lib/meetingsStore";

export default function DashboardPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  const fetchMeetings = async () => {
    try {
      const isDemo =
        typeof window !== "undefined" &&
        (localStorage.getItem("token") === "demo_token" ||
          document.cookie.includes("demo_session=true"));

      setIsDemoUser(Boolean(isDemo));

      if (isDemo) {
        setMeetings(getStoredMeetings());
        setLoading(false);
        return;
      }

      const res = await api.get("/meetings/");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setMeetings(res.data);
      } else {
        setMeetings(getStoredMeetings());
      }
    } catch {
      // Fallback seamlessly to stored demo meetings if backend is offline
      setMeetings(getStoredMeetings());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const isDemo =
      typeof window !== "undefined" &&
      (token === "demo_token" || document.cookie.includes("demo_session=true"));

    if (!isSignedIn && !token && !isDemo) {
      router.push("/login");
      return;
    }

    fetchMeetings();
  }, [isLoaded, isSignedIn]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Hapus meeting ini?")) return;
    deleteStoredMeeting(id);
    try {
      await api.delete(`/meetings/${id}`);
    } catch {
      // Ignore if backend is offline
    }
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const handleResetDemo = () => {
    if (!confirm("Reset semua sample meeting ke data awal?")) return;
    resetDemoMeetings();
    setMeetings(getStoredMeetings());
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarApp />

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 min-h-[calc(100vh-57px)] bg-white border-r border-slate-100 p-4 space-y-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Favorites
            </p>
            <div className="space-y-1">
              <div
                onClick={() => {
                  if (meetings[0]) router.push(`/dashboard/meeting/${meetings[0].id}`);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <span className="text-yellow-400">★</span> Product Roadmap
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Projects
            </p>
            <div className="space-y-1">
              {["Engineering", "Marketing", "Client Syncs"].map((p) => (
                <div
                  key={p}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📁</span> {p}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleResetDemo}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
              title="Kembalikan data meeting contoh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
          </div>

          <div className="absolute bottom-6 left-0 w-56 px-4">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-1.5 mb-1 text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">AI Powered</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Groq LLaMA 3.1 & Whisper Engine active
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-slate-400">Library › All Meetings</p>
                {isDemoUser && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-200">
                    <Sparkles className="w-3 h-3" /> Demo Mode Active
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Your Workspace</h1>
              <p className="text-slate-500 mt-1 text-sm">
                Efficiency is clarity. Access your meeting transcripts, summaries, and action items instantly.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/upload">
                <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm">
                  <Plus className="w-4 h-4" /> Upload Meeting
                </button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-slate-400 text-sm py-12 text-center">Memuat data meeting...</div>
          ) : meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Belum ada meeting</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm">
                Upload rekaman audio atau teks meeting Anda, atau klik reset sample data untuk melihat contoh meeting.
              </p>
              <div className="flex gap-3">
                <Link href="/dashboard/upload">
                  <button className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-700 transition">
                    <Plus className="w-4 h-4" /> Upload Meeting
                  </button>
                </Link>
                <button
                  onClick={handleResetDemo}
                  className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-50 transition"
                >
                  <RotateCcw className="w-4 h-4" /> Muat Contoh Meeting
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-100 bg-slate-50/50">
                <div className="col-span-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Title
                </div>
                <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </div>
                <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </div>
                <div className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </div>
              </div>

              {meetings.map((meeting, i) => (
                <div
                  key={meeting.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/80 transition cursor-pointer ${
                    i !== meetings.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                  onClick={() => router.push(`/dashboard/meeting/${meeting.id}`)}
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {meeting.title}
                      </p>
                      {meeting.summary && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {meeting.summary}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={meeting.status} />
                  </div>
                  <div className="col-span-2 text-xs text-slate-500">
                    {new Date(meeting.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div
                    className="col-span-3 flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => router.push(`/dashboard/meeting/${meeting.id}`)}
                      className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition text-slate-700 font-medium"
                    >
                      Buka Detail
                    </button>
                    <button
                      onClick={(e) => handleDelete(meeting.id, e)}
                      className="text-xs border border-red-100 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {meetings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Total Meetings
                </p>
                <p className="text-3xl font-bold text-slate-900">{meetings.length}</p>
                <p className="text-xs text-slate-400 mt-1">Tersimpan dalam workspace</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  AI Summarized
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {meetings.filter((m) => m.status === "done").length}
                </p>
                <p className="text-xs text-slate-400 mt-1">Dianalisis dengan LLaMA 3.1</p>
              </div>
              <div className="bg-blue-50/80 rounded-2xl border border-blue-100 p-5 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-1.5 text-blue-800 text-xs font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Live AI Engine</span>
                  </div>
                  <p className="text-sm font-bold text-blue-950">LLaMA 3.1 & Whisper</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Unggah meeting baru untuk uji real AI
                  </p>
                </div>
                <Link href="/dashboard/upload">
                  <button className="bg-blue-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-blue-700 transition shrink-0 shadow-sm">
                    Coba Upload
                  </button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
