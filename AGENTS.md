# GitViz repository instructions

## Product boundary

Build only the MVP defined in `docs/PRD.md`. The primary user is a technical product manager entering an unfamiliar public repository. Do not add private-repository authentication, organization-wide indexing, code editing, billing, teams, or broad language support unless the PRD is explicitly revised first.

## Architecture conventions

- Treat the versioned canonical graph as the system of record.
- Run deterministic analysis before optional AI enrichment.
- Never send an entire repository to a model.
- Require source evidence for inferred nodes, edges, features, and generated claims.
- Keep language and framework logic behind analyzers that emit the shared schema.
- Return explicit partial or reduced-intelligence results instead of hiding limitations.
- Keep precomputed demos usable without GitHub API access or AI inference.

## Implementation discipline

- Prefer the simplest implementation that satisfies an MVP acceptance criterion.
- Add tests for parsers, schema validation, URL handling, exclusions, and provenance.
- Do not silently broaden supported languages or frameworks.
- Document material scope or schema decisions in the PRD decision log.
- Preserve keyboard-accessible textual details for information shown in the graph.
