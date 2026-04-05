const statusMap: Record<string, { label: string; color: string }> = {
  pending:     { label: "Pending",      color: "bg-slate-100 text-slate-600" },
  processing:  { label: "Transcribing", color: "bg-blue-100 text-blue-600" },
  transcribed: { label: "Transcribed",  color: "bg-yellow-100 text-yellow-700" },
  done:        { label: "Analyzed",     color: "bg-green-100 text-green-700" },
  error:       { label: "Error",        color: "bg-red-100 text-red-600" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] || statusMap.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {s.label.toUpperCase()}
    </span>
  );
}