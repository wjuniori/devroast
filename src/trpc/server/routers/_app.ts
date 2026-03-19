import { router } from "../trpc";
import { leaderboardRouter } from "./leaderboard";
import { metricsRouter } from "./metrics";

export const appRouter = router({
  metrics: metricsRouter,
  leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;
