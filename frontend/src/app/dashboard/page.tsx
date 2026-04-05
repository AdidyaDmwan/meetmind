"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import NavbarApp from "@/components/NavbarApp";
import StatusBadge from "@/components/StatusBadge";
import { FileText, Plus, Filter, ArrowUpDown } from "lucide-react";
import Link from "next/link";

interface Meeting {
  id: string;
  title: string;
  status: string;
  summary: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    api.get("/meetings/").then((res) => setMeetings(res.data))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Hapus meeting ini?")) return;
    await api.delete(`/meetings/${id}`);
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarApp />

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 min-h-[calc(100vh-57px)] bg-white border-r border-slate-100 p-4 space-y-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Favorites</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
                <span className="text-yellow-400">★</span> Product Roadmap
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Projects</p>
            <div className="space-y-1">
              {["Engineering", "Marketing", "Client Syncs"].map((p) => (
                <div key={p} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📁</span> {p}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-6 left-0 w-56 px-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">Storage Usage</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "60%" }} />
              </div>
              <p className="text-xs text-slate-400">15.2 GB of 20 GB used</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-xs text-slate-400 mb-1">Library › All Meetings</p>
              <h1 className="text-3xl font-bold text-slate-900">Your Workspace</h1>
              <p className="text-slate-500 mt-1">Efficiency is clarity. Access your meeting transcripts, summaries, and action items instantly.</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 border border-slate-200 bg-white text-sm text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition">
                <Filter className="w-4 h-4" /> Filter
              </button>
              <button className="flex items-center gap-2 border border-slate-200 bg-white text-sm text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition">
                <ArrowUpDown className="w-4 h-4" /> Sort
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-slate-400 text-sm">Memuat...</div>
          ) : meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No meetings yet</h3>
              <p className="text-slate-400 text-sm mb-6">Upload your first meeting to get started</p>
              <Link href="/dashboard/upload">
                <button className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-slate-700 transition">
                  <Plus className="w-4 h-4" /> Upload Meeting
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100">
                <div className="col-span-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</div>
                <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</div>
                <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</div>
                <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</div>
              </div>

              {meetings.map((meeting, i) => (
                <div key={meeting.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition cursor-pointer ${i !== meetings.length - 1 ? "border-b border-slate-100" : ""}`}
  onClick={() => router.push(`/dashboard/meeting/${meeting.id}`)}>
  <div className="col-span-5 flex items-center gap-3">
    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
      <FileText className="w-4 h-4 text-blue-500" />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-900">{meeting.title}</p>
      {meeting.summary && (
        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{meeting.summary}</p>
      )}
    </div>
  </div>
  <div className="col-span-2">
    <StatusBadge status={meeting.status} />
  </div>
  <div className="col-span-2 text-sm text-slate-500">
    {new Date(meeting.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
  </div>
  <div className="col-span-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
    <button onClick={() => router.push(`/dashboard/meeting/${meeting.id}`)}
      className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition text-slate-600">
      View
    </button>
    <button onClick={(e) => handleDelete(meeting.id, e)}
      className="text-xs border border-red-100 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
      Delete
    </button>
  </div>
</div>
              ))}
            </div>
          )}

          {/* Stats */}
          {meetings.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Meetings</p>
                <p className="text-3xl font-bold text-slate-900">{meetings.length}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Analyzed</p>
                <p className="text-3xl font-bold text-slate-900">{meetings.filter(m => m.status === "done").length}</p>
              </div>
              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">AI Spotlight</p>
                  <p className="text-sm font-bold text-blue-900">Summary Draft Ready</p>
                  <p className="text-xs text-blue-600 mt-1">Your latest meeting has been analyzed</p>
                </div>
                <button className="bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-blue-700 transition shrink-0">
                  View Insights
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}