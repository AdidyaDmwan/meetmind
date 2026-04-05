"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { ArrowLeft, Sparkles, Circle, CheckCircle, Download } from "lucide-react";
import Link from "next/link";

interface ActionItem { id: string; description: string; assignee: string | null; due_date: string | null; is_done: boolean; }
interface KeyDecision { id: string; description: string; }
interface Meeting {
  id: string; title: string; status: string; summary: string | null;
  raw_transcript: string | null; created_at: string;
  action_items: ActionItem[]; key_decisions: KeyDecision[];
}

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    api.get(`/meetings/${params.id}`)
      .then((res) => setMeeting(res.data))
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const res = await api.post(`/meetings/${params.id}/summarize`);
      setMeeting(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Gagal menganalisis meeting");
    } finally {
      setSummarizing(false);
    }
  };

  const handleDownload = () => {
    if (!meeting?.raw_transcript) return;
    const blob = new Blob([meeting.raw_transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title}.txt`;
    a.click();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Memuat...</div>;
  if (!meeting) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">{meeting.title}</h1>
          <StatusBadge status={meeting.status} />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Transcript ready banner */}
        {meeting.status === "transcribed" && (
          <div className="bg-blue-600 rounded-2xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Transcript ready!</p>
                <p className="text-blue-200 text-xs">Analyze the conversation with AI to extract deep insights.</p>
              </div>
            </div>
            <button onClick={handleSummarize} disabled={summarizing}
              className="bg-white text-blue-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition disabled:opacity-60">
              {summarizing ? "Analyzing..." : "Analyze with AI"}
            </button>
          </div>
        )}

        {/* AI Summary */}
        {meeting.summary && (
          <div className="border-l-4 border-yellow-400 pl-5 py-2">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Summary</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{meeting.summary}</p>
          </div>
        )}

        {/* Action Items */}
        {meeting.action_items.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Action Items</p>
            <div className="space-y-4">
              {meeting.action_items.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  {item.is_done
                    ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    : <Circle className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" />
                  }
                  <div>
                    <p className="text-sm text-slate-800 font-medium">{item.description}</p>
                    <div className="flex items-center gap-4 mt-1">
                      {item.assignee && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <span>👤</span> {item.assignee}
                        </span>
                      )}
                      {item.due_date && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
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
        {meeting.key_decisions.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Key Decisions</p>
            <ul className="space-y-3">
              {meeting.key_decisions.map((kd) => (
                <li key={kd.id} className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold mt-0.5">•</span>
                  <p className="text-sm text-slate-700">{kd.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transcript */}
        {meeting.raw_transcript && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Transcript</p>
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition">
                <Download className="w-3.5 h-3.5" /> Download Text
              </button>
            </div>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              {meeting.raw_transcript.split("\n").filter(Boolean).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}