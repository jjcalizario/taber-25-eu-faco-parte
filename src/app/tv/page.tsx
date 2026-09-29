import type { Metadata } from "next";
import { Suspense } from "react";
import { TvPlayer } from "@/components/tv/TvPlayer";

export const metadata: Metadata = { title: "Taber 25 · Telão" };

export default function Tv() {
  return (
    <Suspense fallback={<div className="h-dvh w-screen bg-black" />}>
      <TvPlayer />
    </Suspense>
  );
}
