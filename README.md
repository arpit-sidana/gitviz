# GitViz

GitViz is a work-in-progress public repository explorer. It turns an unfamiliar GitHub repository into an evidence-backed map of its product capabilities, implementation flows, architecture, and project evolution.

**Live preview:** [gitviz.arpitsidana.chatgpt.site](https://gitviz.arpitsidana.chatgpt.site)  
**Source:** [github.com/arpit-sidana/gitviz](https://github.com/arpit-sidana/gitviz)

Paste a public repository URL to explore:

- **Overview** — what the repository is and what GitViz can currently support.
- **Product Flow** — product capabilities connected to the code that implements them.
- **Architecture** — the system's major modules and dependencies.
- **Evolution** — historical changes grounded in commits and releases.
- **Evaluation** — inspectable answers with source evidence and limitations.

Readers can choose their own depth—**Orientation**, **Trace**, or **Inspect**—without being assigned a persona.

GitViz is intentionally narrow for its first release. It uses deterministic code analysis as the source of truth and may use AI to enrich small, structured slices of the resulting graph. Generated claims must retain file-level provenance.

## Project status

Work in progress. The locked product requirements are documented in [docs/PRD.md](docs/PRD.md). The current public slice is a validated landing experience; repository ingestion and the canonical graph are next.

## MVP focus

- Public GitHub repositories
- Deep analysis for Python and JavaScript/TypeScript
- Reduced file-structure analysis for other languages
- Overview, Product Flow, Architecture, Evolution, and Evaluation views
- Precomputed demos for a reliable hosted experience

## License

[MIT](LICENSE)
