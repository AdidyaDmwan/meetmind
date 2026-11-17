"use client";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export default function ClerkTokenSync() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      getToken().then((token) => {
        if (token) {
          const existing = localStorage.getItem("token");
          if (!existing) {
            localStorage.setItem("token", token);
          }
        }
      });
    }
  }, [isSignedIn, isLoaded]);

  return null;
}