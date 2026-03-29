"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StatusFilter({
  options,
  paramName = "status",
}: {
  options: Array<{ value: string; label: string }>;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) || "";

  function handleChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={current || "ALL"} onValueChange={handleChange}>
      <SelectTrigger className="w-36">
        <SelectValue>
          {current
            ? options.find((o) => o.value === current)?.label || current
            : "すべて"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">すべて</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
