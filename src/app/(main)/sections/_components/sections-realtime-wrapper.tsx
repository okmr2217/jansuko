"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { SectionListItem, SectionStatus } from "@/lib/db/queries/sections";
import { fetchSectionsAction } from "../actions";
import { SectionList } from "./section-list";
import { SectionFilters } from "./section-filters";

interface SectionsRealtimeWrapperProps {
  initialSections: SectionListItem[];
  currentUserId?: string;
  filters: {
    status?: SectionStatus;
    search?: string;
    sort: "asc" | "desc";
  };
}

export function SectionsRealtimeWrapper({
  initialSections,
  currentUserId,
  filters,
}: SectionsRealtimeWrapperProps) {
  const [sections, setSections] = useState<SectionListItem[]>(initialSections);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const filtersRef = useRef(filters);

  // filtersの最新値を保持
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // initialSectionsが変わったら更新（フィルター変更時など）
  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const refetchSections = useCallback(async () => {
    try {
      const currentFilters = filtersRef.current;
      const newSections = await fetchSectionsAction({
        status: currentFilters.status,
        search: currentFilters.search,
        sortOrder: currentFilters.sort,
      });
      setSections(newSections);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // 既存のチャンネルがあれば削除
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel("sections-realtime", {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sections",
        },
        (payload) => {
          console.log("sections change:", payload);
          refetchSections();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "section_participants",
        },
        (payload) => {
          console.log("section_participants change:", payload);
          refetchSections();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
        },
        (payload) => {
          console.log("games change:", payload);
          refetchSections();
        }
      );
      
    channelRef.current = channel;

    channel.subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("Realtime subscribed to sections-realtime");
        setIsSubscribed(true);
      } else if (status === "CHANNEL_ERROR") {
        console.error("Realtime channel error:", err);
        setIsSubscribed(false);
      } else if (status === "TIMED_OUT") {
        console.error("Realtime subscription timed out");
        setIsSubscribed(false);
      } else {
        console.log("Realtime status:", status);
      }
    });

    return () => {
      if (channelRef.current) {
        console.log("Unsubscribing from sections-realtime");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [refetchSections]);

  return (
    <>
      <SectionFilters
        currentStatus={filters.status}
        currentSearch={filters.search}
        currentSort={filters.sort}
      />
      <SectionList sections={sections} currentUserId={currentUserId} />
      {!isSubscribed && (
        <div className="fixed bottom-4 right-4 rounded bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
          リアルタイム接続中...
        </div>
      )}
    </>
  );
}
