"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";
import { SectionStatus } from "@/lib/db/queries/sections";

interface SectionFiltersProps {
  currentStatus?: SectionStatus;
  currentSearch?: string;
  currentSort: "asc" | "desc";
}

export function SectionFilters({
  currentStatus,
  currentSearch,
  currentSort,
}: SectionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentSearch ?? "");

  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      startTransition(() => {
        router.push(`/sections?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  const handleStatusChange = (value: string) => {
    updateSearchParams({ status: value === "all" ? undefined : value });
  };

  const handleSearch = () => {
    updateSearchParams({ search: searchValue || undefined });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSortToggle = () => {
    updateSearchParams({ sort: currentSort === "desc" ? "asc" : "desc" });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="セクション名で検索..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-xs"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleSearch}
          disabled={isPending}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={currentStatus ?? "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="active">進行中</SelectItem>
            <SelectItem value="closed">終了</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSortToggle}
          disabled={isPending}
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {currentSort === "desc" ? "新しい順" : "古い順"}
        </Button>
      </div>
    </div>
  );
}
