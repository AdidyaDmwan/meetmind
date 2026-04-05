"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import NavbarApp from "@/components/NavbarApp";
import { CloudUpload, X, Zap, Lock } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Pilih file terlebih dahulu"); return; }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    try {
      const res = await api.post("/meetings/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push(`/dashboard/meeting/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Gagal upload file");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarApp />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Distill your conversations.</h1>
          <p className="text-slate-500">Upload audio or text recordings to generate high-fidelity<br />AI summaries and actionable insights.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Upload Meeting File</h2>

          <form onSubmit={handleUpload} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meeting Title</label>
              <input placeholder="e.g. Q4 Product Roadmap Sync" value={title}
                onChange={(e) => setTitle(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
                dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudUpload className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-slate-700 font-medium mb-1">Drag & drop your file here or click to browse</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Max file size: 500MB</p>
              <input ref={inputRef} type="file" accept=".txt,.pdf,.mp3,.mp4,.wav,.m4a,.ogg,.webm"
                onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
            </div>

            <div className="flex gap-2 flex-wrap">
              {[".txt", ".pdf", ".mp3", ".mp4", ".wav", ".m4a"].map((ext) => (
                    <span key={ext} className="text-xs border border-slate-200 text-slate-500 px-3 py-1 rounded-full">{ext}</span>
                ))}
            </div>

            {file && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">{file.name.split(".").pop()?.toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-slate-700 font-medium">{file.name}</span>
                </div>
                <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? "Mengupload..." : <><span>Upload & Process</span><Zap className="w-4 h-4" /></>}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="flex items-start gap-3 bg-white rounded-2xl border border-slate-100 p-5">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Private & Secure</p>
              <p className="text-xs text-slate-500 mt-1">Your data is encrypted end-to-end and never used for model training without consent.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-2xl border border-slate-100 p-5">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">AI Extraction</p>
              <p className="text-xs text-slate-500 mt-1">Instant task extraction, and sentiment analysis for every upload.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-xs text-slate-400 flex justify-between px-8">
        <span>© 2024 MEETMIND AI. DISTILLING CHAOS INTO CLARITY.</span>
        <div className="flex gap-6">
          <span>PRIVACY POLICY</span><span>TERMS OF SERVICE</span><span>HELP CENTER</span>
        </div>
      </footer>
    </div>
  );
}