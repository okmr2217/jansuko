"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type PeriodType = "all" | "this-month" | "last-month" | "custom";

interface PeriodSelectorProps {
  period: PeriodType;
  from?: string;
  to?: string;
}

function getDateRangeForPeriod(period: PeriodType): {
  from?: string;
  to?: string;
} {
  const now = new Date();

  switch (period) {
    case "this-month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        from: from.toISOString().split("T")[0],
        to: undefined,
      };
    }
    case "last-month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
      };
    }
    case "all":
    default:
      return { from: undefined, to: undefined };
  }
}

export function PeriodSelector({ period, from, to }: PeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePeriodChange = (newPeriod: PeriodType) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newPeriod === "custom") {
      params.set("period", "custom");
      // カスタムの場合は既存のfrom/toを保持
    } else if (newPeriod === "all") {
      params.delete("period");
      params.delete("from");
      params.delete("to");
    } else {
      const dateRange = getDateRangeForPeriod(newPeriod);
      params.set("period", newPeriod);
      if (dateRange.from) {
        params.set("from", dateRange.from);
      } else {
        params.delete("from");
      }
      if (dateRange.to) {
        params.set("to", dateRange.to);
      } else {
        params.delete("to");
      }
    }

    router.push(`/stats?${params.toString()}`);
  };

  const handleCustomDateChange = (type: "from" | "to", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", "custom");

    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }

    router.push(`/stats?${params.toString()}`);
  };

  const handleResetCustom = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("period");
    params.delete("from");
    params.delete("to");
    router.push(`/stats?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="space-y-2">
        <Label>期間</Label>
        <Select
          value={period}
          onValueChange={(v) => handlePeriodChange(v as PeriodType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="期間を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全期間</SelectItem>
            <SelectItem value="this-month">今月</SelectItem>
            <SelectItem value="last-month">先月</SelectItem>
            <SelectItem value="custom">カスタム</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {period === "custom" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="from">開始日</Label>
            <Input
              id="from"
              type="date"
              value={from ?? ""}
              onChange={(e) => handleCustomDateChange("from", e.target.value)}
              className="w-[160px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">終了日</Label>
            <Input
              id="to"
              type="date"
              value={to ?? ""}
              onChange={(e) => handleCustomDateChange("to", e.target.value)}
              className="w-[160px]"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleResetCustom}>
            リセット
          </Button>
        </>
      )}
    </div>
  );
}
