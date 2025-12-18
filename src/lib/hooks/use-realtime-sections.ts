"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export function useRealtimeSections() {
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      channel = supabase
        .channel("sections-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "sections",
          },
          () => {
            refresh();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "section_participants",
          },
          () => {
            refresh();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "games",
          },
          () => {
            refresh();
          }
        )
        .subscribe((status) => {
          setIsSubscribed(status === "SUBSCRIBED");
        });
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [refresh]);

  return { isSubscribed };
}
