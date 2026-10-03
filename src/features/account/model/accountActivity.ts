import { api } from "@/shared/api/client";
import type {
  ActivityHeatmapDayDto,
  ActivityStatsDto,
} from "@/shared/api/types";

export type AccountActivity = {
  days: ActivityHeatmapDayDto[];
  stats: ActivityStatsDto;
};

export async function loadAccountActivity(year: number): Promise<AccountActivity> {
  const [heatmap, stats] = await Promise.all([
    api.activity.heatmap(year),
    api.activity.stats(28),
  ]);
  return {
    days: heatmap.days,
    stats,
  };
}

export function lastActivityDays(
  days: ActivityHeatmapDayDto[],
  count = 28,
) {
  return [...days]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-Math.max(1, count));
}
