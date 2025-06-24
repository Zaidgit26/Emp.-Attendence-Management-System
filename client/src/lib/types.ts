import type { Leave } from "@shared/schema";

export interface LeaveStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export type { Leave };
