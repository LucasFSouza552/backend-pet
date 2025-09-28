import IHistory from "../models/history";

export type HistoryDTO = Omit<IHistory, "createdAt" | "updatedAt">;

export type UpdateHistoryDTO = Pick<IHistory, "status"> & Partial<Pick<IHistory, "petId">>;

export type CreateHistoryDTO = Omit<IHistory, "createdAt" | "updatedAt">;