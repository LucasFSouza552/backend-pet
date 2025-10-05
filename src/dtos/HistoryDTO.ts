import IHistory from "../models/history";

export type HistoryDTO = Omit<IHistory, "createdAt" | "updatedAt">;

export type UpdateHistoryDTO = Pick<IHistory, "status"> & Partial<Pick<IHistory, "pet">>;

export type CreateHistoryDTO = Omit<IHistory, "createdAt" | "updatedAt">;