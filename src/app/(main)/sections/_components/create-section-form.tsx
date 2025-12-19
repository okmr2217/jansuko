"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createSectionSchema,
  CreateSectionInput,
  STARTING_POINTS_OPTIONS,
  RETURN_POINTS_OPTIONS,
  RATE_OPTIONS,
} from "@/lib/validations/section";
import { createSectionAction } from "../actions";
import { User } from "@/lib/db/queries/users";

interface CreateSectionFormProps {
  users: User[];
}

export function CreateSectionForm({ users }: CreateSectionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const getDefaultName = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${year}年${month}月${day}日`;
  };

  const form = useForm<CreateSectionInput>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: {
      name: getDefaultName(),
      startingPoints: 35000,
      returnPoints: 35000,
      rate: 50,
      playerCount: 3,
      participantIds: [],
    },
  });

  const playerCount = form.watch("playerCount");
  const selectedParticipants = form.watch("participantIds");

  async function onSubmit(data: CreateSectionInput) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("startingPoints", data.startingPoints.toString());
      formData.append("returnPoints", data.returnPoints.toString());
      formData.append("rate", data.rate.toString());
      formData.append("playerCount", data.playerCount.toString());
      data.participantIds.forEach((id) => {
        formData.append("participantIds", id);
      });

      const result = await createSectionAction(formData);

      if (result.success) {
        toast.success("セクションを作成しました");
        router.push(`/sections/${result.sectionId}`);
      } else {
        toast.error(result.error || "エラーが発生しました");
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>セクション名</FormLabel>
              <FormControl>
                <Input placeholder="例: 2024年12月 定例会" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="playerCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>参加人数</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(Number(value));
                  // 人数変更時に参加者をリセット
                  form.setValue("participantIds", []);
                }}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="参加人数を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="3">3人麻雀</SelectItem>
                  <SelectItem value="4">4人麻雀</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="participantIds"
          render={() => (
            <FormItem>
              <FormLabel>
                参加者 ({selectedParticipants.length}/{playerCount}人選択)
              </FormLabel>
              <FormDescription>
                参加する雀士を{playerCount}人選択してください
              </FormDescription>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {users.map((user) => (
                  <FormField
                    key={user.id}
                    control={form.control}
                    name="participantIds"
                    render={({ field }) => {
                      const isChecked = field.value.includes(user.id);
                      const isDisabled =
                        !isChecked && field.value.length >= playerCount;

                      return (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={isChecked}
                              disabled={isDisabled}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, user.id]);
                                } else {
                                  field.onChange(
                                    field.value.filter((id) => id !== user.id)
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {user.displayName}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="startingPoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>開始点</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="開始点を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STARTING_POINTS_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="returnPoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>返し点</FormLabel>
                <FormDescription>
                  順位点計算の基準となる点数
                </FormDescription>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="返し点を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RETURN_POINTS_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>レート</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="レートを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RATE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "作成中..." : "作成"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
