"use client";

import { useRealtimeSections } from "@/lib/hooks/use-realtime-sections";

interface SectionsRealtimeWrapperProps {
  children: React.ReactNode;
}

export function SectionsRealtimeWrapper({
  children,
}: SectionsRealtimeWrapperProps) {
  useRealtimeSections();
  return <>{children}</>;
}
