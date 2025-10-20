export interface GameSession {
  id: string;
  mind_map_id: string;
  score: number;
  completed: boolean;
  time_elapsed_seconds: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface GameSessionCreate {
  mind_map_id: string;
}

export interface GameSessionUpdate {
  edges: Array<{ source: string; target: string }>;
  time_elapsed_seconds: number;
}
