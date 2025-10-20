export interface MindMapNode {
  id: string;
  label: string;
  content: string | null;
  position: { x: number; y: number } | null;
  level: number;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface MindMap {
  id: string;
  title: string;
  pdf_filename: string | null;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  created_at: string;
  updated_at: string;
}

export interface MindMapListItem {
  id: string;
  title: string;
  pdf_filename: string | null;
  created_at: string;
  updated_at: string;
}
