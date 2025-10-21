import { useState, useEffect } from "react";
import type { MindMap, MindMapListItem } from "../types/mindmap";
import { mindMapService } from "../services/mindMapService";

export function useMindMap(id?: string) {
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadMindMap(id);
    }
  }, [id]);

  const loadMindMap = async (mapId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mindMapService.getMindMapById(mapId);
      setMindMap(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error loading mind map");
    } finally {
      setLoading(false);
    }
  };

  const uploadPDF = async (file: File, title?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mindMapService.uploadPDF(file, title);
      setMindMap(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error uploading PDF");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    mindMap,
    loading,
    error,
    loadMindMap,
    uploadPDF,
  };
}

export function useMindMaps() {
  const [mindMaps, setMindMaps] = useState<MindMapListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMindMaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mindMapService.getMindMaps();
      setMindMaps(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al cargar mapas mentales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMindMaps();
  }, []);

  return {
    mindMaps,
    loading,
    error,
    reload: loadMindMaps,
  };
}
