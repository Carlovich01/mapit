from typing import Set, Tuple


class GraphValidator:
    """Validate graph structure for the reordering game."""

    @staticmethod
    def normalize_edge(source: str, target: str) -> Tuple[str, str]:
        """Normalize an edge by sorting node IDs (for undirected comparison)."""
        return tuple(sorted([source, target]))

    @staticmethod
    def edges_to_set(edges: list[dict]) -> Set[Tuple[str, str]]:
        """Convert list of edges to a set of normalized tuples."""
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
        Calculate score by comparing submitted edges with original edges.

        Returns score out of 100:
        - 100: perfect match (all edges correct)
        - 0-99: partial score based on correct edges
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
        """Check if submitted edges exactly match original edges."""
        return GraphValidator.calculate_score(original_edges, submitted_edges) == 100
