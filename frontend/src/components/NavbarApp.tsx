"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Upload, Search } from "lucide-react";

export default function NavbarApp() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", label: "Meetings" },
    { href: "/dashboard/upload", label: "Upload" },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-8 sticky top-0 z-50">
      <Link href="/dashboard" className="text-xl font-bold text-slate-900 tracking-tight">
        MeetMind
      </Link>
      <div className="flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              pathname === link.href
                ? "text-slate-900 border-b-2 border-slate-900 pb-0.5"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search meetings or transcripts"
            className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
          />
        </div>
        <Link href="/dashboard/upload">
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Upload className="w-4 h-4" />
            Upload Meeting
          </button>
        </Link>
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-slate-700 transition rounded-lg hover:bg-slate-100"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}