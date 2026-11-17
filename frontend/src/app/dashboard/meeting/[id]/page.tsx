"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import {
  ArrowLeft,
  Sparkles,
  Circle,
  CheckCircle,
  Download,
  RotateCw,
} from "lucide-react";
import Link from "next/link";
import {
  getMeetingById,
  upsertMeeting,
  Meeting,
} from "@/lib/meetingsStore";

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = typeof params?.id === "string" ? params.id : "";
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (!meetingId) return;

    // Check client storage first (instant & reliable)
    const local = getMeetingById(meetingId);
    if (local) {
      setMeeting(local);
      setLoading(false);
      return;
    }

    // Otherwise check backend if available
    api
      .get(`/meetings/${meetingId}`)
      .then((res) => {
        setMeeting(res.data);
      })
      .catch(() => {
        router.push("/dashboard");
      })
      .finally(() => setLoading(false));
}, [meetingId]);

const handleSummarize = async () => {
  if (!meeting?.raw_transcript) return;
  setSummarizing(true);
  try {
    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: meeting.raw_transcript }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal menganalisis meeting");

    const updated: Meeting = {
      ...meeting,
      summary: data.summary,
      action_items: (data.action_items || []).map((item: any, idx: number) => ({
        id: `ai-act-${Date.now()}-${idx}`,
        description: item.description,
        assignee: item.assignee || null,
        due_date: item.due_date || null,
        is_done: false,
      })),
      key_decisions: (data.key_decisions || []).map((kd: any, idx: number) => ({
        id: `ai-kd-${Date.now()}-${idx}`,
        description: kd.description,
      })),
      status: "done",
    };

    setMeeting(updated);
    upsertMeeting(updated);
  } catch (err: any) {
    alert(err.message || "Gagal menganalisis meeting");
  } finally {
    setSummarizing(false);
  }
};

const toggleActionItem = (itemId: string) => {
  if (!meeting) return;
  const updatedItems = meeting.action_items.map((item) =>
    item.id === itemId ? { ...item, is_done: !item.is_done } : item
  );
  const updated = { ...meeting, action_items: updatedItems };
  setMeeting(updated);
  upsertMeeting(updated);
};

const handleDownload = () => {
  if (!meeting?.raw_transcript) return;
  const blob = new Blob([meeting.raw_transcript], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${meeting.title.replace(/\s+/g, "_")}.txt`;
  a.click();
};

if (loading)
  return (
    <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
      Memuat detail meeting...
    </div>
  );
if (!meeting) return null;

return (
  <div className="min-h-screen bg-white">
    {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-slate-900">
                {meeting.title}
              </h1>
              <StatusBadge status={meeting.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dibuat pada{" "}
              {new Date(meeting.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {meeting.raw_transcript && (
            <button
              onClick={handleSummarize}
              disabled={summarizing}
              className="flex items-center gap-1.5 text-xs font-medium border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3.5 py-2 rounded-lg transition disabled:opacity-60 shadow-sm"
              title="Minta AI LLaMA 3.1 menganalisis ulang transkrip ini"
            >
              {summarizing ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Menganalisis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Re-analyze with AI</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

            <main className="max-w-2xl mx-auto px-6 py-8 space-y-7">
              {/* Banner if ready to analyze */}
              {meeting.status !== "done" && meeting.raw_transcript && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 flex items-center justify-between shadow-sm text-white">
                  <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Transkrip Siap Dianalisis</p>
                        <p className="text-blue-100 text-xs mt-0.5">
                          Ekstrak ringkasan, action items, dan keputusan penting dengan Groq LLaMA 3.1.
                        </p>
                      </div>
                    </div>
                      <button
                        onClick={handleSummarize}
                        disabled={summarizing}
                        className="bg-white text-blue-700 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-50 transition disabled:opacity-60 shrink-0 shadow-sm"
                      >
                        {summarizing ? "Menganalisis..." : "Analyze with AI"}
                      </button>
                  </div>
        )}

                  {/* AI Summary */}
                  {meeting.summary && (
                        <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                              AI Executive Summary
                            </span>
                          </div>
                          <p className="text-slate-800 leading-relaxed text-sm">
                            {meeting.summary}
                          </p>
                        </div>
        )}

                        {/* Action Items */}
                          {
                            meeting.action_items && meeting.action_items.length > 0 && (
                              <div>
                                  <div className="flex items-center justify-between mb-3.5">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                      Action Items ({meeting.action_items.filter((a) => a.is_done).length}/
                                      {meeting.action_items.length} selesai)
                                    </p>
                                    <span className="text-[11px] text-slate-400">Klik checklist untuk update status</span>
                                  </div>
                                  <div className="space-y-2.5">
                                    {meeting.action_items.map((item) => (
                                            <div
                                              key={item.id}
                                              onClick={() => toggleActionItem(item.id)}
                                              className={`flex items-start gap-3.5 p-3 rounded-xl border transition cursor-pointer ${item.is_done
                                                  ? "bg-slate-50 border-slate-200/80 opacity-75"
                                                  : "bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-xs"
                                                }`}
                                            >
                                              {item.is_done ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                              ) : (
                                                <Circle className="w-5 h-5 text-slate-300 mt-0.5 shrink-0 hover:text-blue-500" />
                                              )}
                                              <div className="flex-1">
                                                <p
                                                  className={`text-sm ${item.is_done
                                                      ? "line-through text-slate-400"
                                                      : "text-slate-800 font-medium"
                                                    }`}
                                                >
                                                  {item.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                                                  {item.assignee && (
                                                      <span className="flex items-center gap-1">
                                                        <span>👤</span> {item.assignee}
                                                      </span>
                      )}
                                                      {item.due_date && (
                                                          <span className="flex items-center gap-1">
                                                            <span>📅</span> {item.due_date}
                                                          </span>
                      )}
                                                        </div>
                  </div>
                </div>
              ))}
                                              </div>
                                            </div>
        )}

                                            {/* Key Decisions */}
                                              {
                                                meeting.key_decisions && meeting.key_decisions.length > 0 && (
                                                  <div>
                                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                        Key Decisions
                                                      </p>
                                                      <ul className="space-y-2.5">
                                                        {meeting.key_decisions.map((kd) => (
                                                            <li
                                                              key={kd.id}
                                                              className="flex items-start gap-3 bg-slate-50/80 border border-slate-100 p-3 rounded-xl"
                                                            >
                                                              <span className="text-blue-500 font-bold mt-0.5">•</span>
                                                              <p className="text-sm text-slate-700 leading-relaxed">
                                                                {kd.description}
                                                              </p>
                                                            </li>
              ))}
                                                          </ul>
          </div>
        )}

                                                      {/* Transcript */}
                                                      {meeting.raw_transcript && (
                                                              <div className="pt-2">
                                                                <div className="flex items-center justify-between mb-3.5">
                                                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                                    Full Transcript
                                                                  </p>
                                                                  <button
                                                                    onClick={handleDownload}
                                                                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                                                                  >
                                                                    <Download className="w-3.5 h-3.5" /> Download (.txt)
                                                                  </button>
                                                                </div>
                                                                  <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-3 text-sm text-slate-700 leading-relaxed font-mono text-[13px]">
                                                                    {meeting.raw_transcript
                                                                      .split("\n")
                                                                      .filter(Boolean)
                                                                      .map((line, i) => (
                                                                        <p key={i}>{line}</p>
                                                                      ))}
                                                                  </div>
                                                                </div>
        )}
                                                              </main>
                                                          </div>
                                                          );
}
