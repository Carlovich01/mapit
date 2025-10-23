from typing import Set, Tuple


class GraphValidator:
    """Validar la estructura del gráfico para el juego de reordenamiento."""

    @staticmethod
    def normalize_edge(source: str, target: str) -> Tuple[str, str]:
        """Normalizar una arista ordenando los IDs de los nodos (para comparación no dirigida)."""
        return tuple(sorted([source, target]))

    @staticmethod
    def edges_to_set(edges: list[dict]) -> Set[Tuple[str, str]]:
        """Convertir lista de aristas a un conjunto de tuplas normalizadas."""
        edge_set = set()
        for edge in edges:
            source = edge.get("source") or edge.get("source_node_id")
            target = edge.get("target") or edge.get("target_node_id")
            if source and target:
                edge_set.add(GraphValidator.normalize_edge(source, target))
        return edge_set

    @staticmethod
    def calculate_score(original_edges: list[dict], submitted_edges: list[dict]) -> int:
        """
        Calcular la puntuación comparando las aristas enviadas con las aristas originales.

        Devuelve una puntuación sobre 100:
        - 100: coincidencia perfecta (todos los bordes son correctos)
        - 0-99: puntuación parcial basada en los bordes correctos
        """
        if not original_edges:
            return 100 if not submitted_edges else 0

        original_set = GraphValidator.edges_to_set(original_edges)
        submitted_set = GraphValidator.edges_to_set(submitted_edges)

        # Count correct edges
        correct_edges = original_set & submitted_set

        # Calculate score
        score = int((len(correct_edges) / len(original_set)) * 100)

        return score

    @staticmethod
    def validate_exact_match(
        original_edges: list[dict], submitted_edges: list[dict]
    ) -> bool:
        """Verificar si los bordes enviados coinciden exactamente con los bordes originales."""
        return GraphValidator.calculate_score(original_edges, submitted_edges) == 100
