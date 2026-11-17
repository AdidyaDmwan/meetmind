"use client";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SSOCallback() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      getToken().then((token) => {
        if (token) {
          localStorage.setItem("token", token);
          router.push("/dashboard");
        }
      });
    }
  }, [isSignedIn, isLoaded]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-500 text-sm">Redirecting...</p>
    </div>
  );
}