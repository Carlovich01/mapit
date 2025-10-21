import api from "./api";
import type { MindMap, MindMapListItem } from "../types/mindmap";

export const mindMapService = {
  async uploadPDF(file: File, title?: string): Promise<MindMap> {
    const formData = new FormData();
    formData.append("file", file);
    if (title) {
      formData.append("title", title);
    }

    const response = await api.post<MindMap>("/mind-maps", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async getMindMaps(
    skip: number = 0,
    limit: number = 100
  ): Promise<MindMapListItem[]> {
    const response = await api.get<MindMapListItem[]>("/mind-maps", {
      params: { skip, limit },
    });
    return response.data;
  },

  async getMindMapById(id: string): Promise<MindMap> {
    const response = await api.get<MindMap>(`/mind-maps/${id}`);
    return response.data;
  },
};
