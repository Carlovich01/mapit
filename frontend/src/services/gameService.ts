import api from "./api";
import type {
  GameSession,
  GameSessionCreate,
  GameSessionUpdate,
} from "../types/game";

export const gameService = {
  async createGameSession(mindMapId: string): Promise<GameSession> {
    const data: GameSessionCreate = { mind_map_id: mindMapId };
    const response = await api.post<GameSession>("/game/sessions", data);
    return response.data;
  },

  async completeGameSession(
    sessionId: string,
    edges: Array<{ source: string; target: string }>,
    timeElapsed: number
  ): Promise<GameSession> {
    const data: GameSessionUpdate = {
      edges,
      time_elapsed_seconds: timeElapsed,
    };
    const response = await api.put<GameSession>(
      `/game/sessions/${sessionId}`,
      data
    );
    return response.data;
  },

  async getGameSession(sessionId: string): Promise<GameSession> {
    const response = await api.get<GameSession>(`/game/sessions/${sessionId}`);
    return response.data;
  },

  async listGameSessions(
    mindMapId?: string,
    limit: number = 50
  ): Promise<GameSession[]> {
    const response = await api.get<GameSession[]>("/game/sessions", {
      params: {
        mind_map_id: mindMapId,
        limit,
      },
    });
    return response.data;
  },
};
