# GitViz

GitViz helps technical product managers, engineering managers, and engineers understand an unfamiliar GitHub repository in minutes.

Paste a public repository URL to explore:

- **Architecture** — the system's major modules and dependencies.
- **Product Map** — product capabilities connected to the code that implements them.
- **Explain** — repository explanations calibrated for executives, product managers, or engineers.

GitViz is intentionally narrow for its first release. It uses deterministic code analysis as the source of truth and may use AI to enrich small, structured slices of the resulting graph. Generated claims must retain file-level provenance.

## Project status

Planning. The initial product requirements are documented in [docs/PRD.md](docs/PRD.md).

## MVP focus

- Public GitHub repositories
- Deep analysis for Python and JavaScript/TypeScript
- Reduced file-structure analysis for other languages
- Architecture, Product Map, and Explain views
- Precomputed demos for a reliable hosted experience

## License

[MIT](LICENSE)
