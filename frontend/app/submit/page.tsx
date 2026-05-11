"use client";

// Redirect page — the submit modal is rendered inline on the feed.
// This route exists for deep-link purposes.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubmitPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/?submit=1"); }, [router]);
  return null;
}
