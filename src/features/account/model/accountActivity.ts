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
  const [current, previous, stats] = await Promise.all([
    api.activity.heatmap(year),
    api.activity.heatmap(year - 1),
    api.activity.stats(28),
  ]);

  const byDate = new Map<string, ActivityHeatmapDayDto>();
  [...previous.days, ...current.days].forEach((day) => byDate.set(day.date, day));

  return {
    days: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)),
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
