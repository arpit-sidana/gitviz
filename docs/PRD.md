# GitViz Product Requirements Document

- **Status:** Draft for implementation
- **Version:** 0.1
- **Target:** 1–2 day MVP
- **Product owner:** Arpit Sidana
**Last updated:** August 20, 2026

## 1. Product summary

GitViz turns a public GitHub repository into a navigable map of its architecture, product surfaces, and likely change dependencies.

**Product promise:** Paste a GitHub repo. Understand what it does, where functionality lives, and what is likely to change together—in minutes, not days.

The MVP is not a universal code-understanding system. It is an orientation tool for a technical product manager entering or scoping an unfamiliar repository. Deterministic analysis creates the system of record; optional AI enrichment makes that evidence easier to understand.

## 2. Problem

People entering an unfamiliar repository must answer basic product and architecture questions before they can make safe decisions:

- What does this system do?
- Where does a product capability live in the code?
- Which modules, data stores, routes, and external services are connected?
- What is likely to be affected by a proposed change?

Today, they answer these questions by reading directory trees, tracing imports, searching routes, studying configuration, and interviewing engineers. This is slow, inconsistent, and especially difficult for technical PMs who can read code but do not know the repository's conventions.

## 3. Target user

### Primary persona

**Technical PM entering an unfamiliar repository**

- Can navigate GitHub and read code at a high level.
- Needs a credible system model before planning or discussing changes.
- Values traceable evidence over an unsupported AI summary.
- Has minutes for initial orientation, not days for exhaustive discovery.

### Secondary users

- Engineering managers scoping ownership and dependencies.
- Engineers onboarding to an existing codebase.

The MVP is optimized for the primary persona. Secondary users do not add separate requirements.

## 4. Jobs to be done

1. **Orient:** When I open an unfamiliar repository, show me its major components and how they connect so I can form a useful mental model quickly.
2. **Locate:** When I need to understand a product capability, show me the routes, UI, services, data stores, external dependencies, and source files that implement it.
3. **Scope:** When I am considering a change, show me the components likely to change together and the evidence behind that relationship so I can ask better questions and identify risk.

## 5. Goals and success metrics

### MVP goals

- Produce a useful first map from a supported public repository without local setup.
- Make every material claim inspectable through file-level provenance.
- Demonstrate that deterministic analysis can support product-oriented repository exploration.
- Deliver a polished, reliable portfolio demo within 1–2 development days.

### Success metrics

| Metric | MVP target | Measurement |
| --- | ---: | --- |
| Time to first useful map | ≤ 60 seconds for a demo-sized supported repo | From valid URL submission to interactive graph |
| Orientation task success | ≥ 80% | At least 4 of 5 test users correctly identify the system's main purpose and two major components in 5 minutes |
| Evidence coverage | 100% of generated feature and dependency claims | Claims contain one or more source file references |
| Evaluation accuracy | ≥ 75% top-3 file recall | Correct file appears in the top three answers across a curated set of at least 20 questions |
| Demo reliability | 100% for three precomputed demos | All three load without live analysis or model inference |

Metrics are directional MVP gates, not production service-level objectives.

## 6. Scope

### In scope

- Accept and validate a public GitHub repository URL.
- Retrieve repository tree metadata and selected useful text files.
- Ignore binaries, secrets, vendored dependencies, build artifacts, and common generated directories.
- Detect languages, frameworks, manifests, configuration, routes, imports, database references, Docker files, and OpenAPI specifications.
- Provide deeper deterministic analysis for Python and JavaScript/TypeScript.
- Build a standardized, provenance-aware graph.
- Render three primary views: Architecture, Product Map, and Explain.
- Let users select Executive, Product Manager, or Engineer explanations.
- Provide related files and evidence when a graph node is selected.
- Ship three precomputed public-repository demos.
- Include a small evaluation set with known answers.

### Non-goals

- Complete semantic understanding of every language or framework.
- Private repository access, GitHub App installation, or enterprise authentication.
- Guaranteed change-impact analysis.
- Runtime tracing, production observability, or live infrastructure discovery.
- Editing code, generating pull requests, or acting as an IDE.
- Organization-wide repository search.
- Continuous repository indexing or automatic refresh.
- Billing, teams, permissions, or production-grade multi-tenancy.
- Sending an entire repository to an LLM.

## 7. User experience

### Primary flow

1. The user lands on GitViz and sees a repository URL field plus precomputed examples.
2. The user pastes a public `github.com/{owner}/{repo}` URL.
3. GitViz validates the URL and displays analysis progress by stage.
4. GitViz opens the Architecture view when a graph is ready.
5. The user switches between Architecture, Product Map, and Explain.
6. The user selects a node or feature to inspect its relationships, summary, and source evidence.
7. The user changes the Explain audience without re-running repository analysis.

### View requirements

#### Architecture

- Show major UI, API, service, data store, and external-dependency nodes.
- Show directional relationships between nodes.
- Support pan, zoom, selection, and basic type filters.
- Open a detail panel with node type, description, connected nodes, and source files.

#### Product Map

- Group implementation nodes into inferred product features such as Authentication or Billing.
- Show the path from product surface to route, service, dependency, and data store when evidence exists.
- Clearly label inferred features and confidence.
- Never present an unreferenced feature claim as fact.

#### Explain

- **Executive:** concise purpose, primary capabilities, and major external dependencies.
- **Product Manager:** product surfaces, ownership clues, dependencies, and likely change areas.
- **Engineer:** routes, modules, calls, persistence, and source-level evidence.
- Reuse the same underlying graph for every audience; only framing and detail level change.

### Error and reduced-intelligence states

- Invalid URL: explain the expected GitHub URL format.
- Missing or private repository: explain that the MVP supports public repositories only.
- GitHub rate limit: offer a precomputed demo and a retry path.
- Oversized or truncated tree: state the limitation and analyze the available subset.
- Unsupported language: show the file structure, detected metadata, and an explicit reduced-intelligence label.
- Partial parser failure: retain successful results and identify missing analysis categories.

## 8. Functional requirements

### FR-1: Repository input

- Normalize supported URL variants to `{owner}/{repo}`.
- Reject non-GitHub hosts and malformed owner/repository paths.
- Do not accept arbitrary clone commands or local paths in the hosted MVP.

### FR-2: Ingestion

- Fetch the repository's default branch and recursive tree through the GitHub API.
- Apply file-size, file-type, and directory exclusion rules before fetching contents.
- Fetch only allowlisted text files useful for analysis.
- Record repository, commit, path, and blob identifiers for provenance.
- Bound files, bytes, and analysis time; return a partial result when a bound is reached.

### FR-3: Deterministic analysis

- Detect repository languages and likely frameworks from extensions and manifests.
- Parse Python and JavaScript/TypeScript imports using language-aware parsing where practical.
- Detect common API-route conventions and OpenAPI-described endpoints.
- Parse dependency manifests and identify external packages/services.
- Detect common database and persistence references.
- Extract configuration and deployment signals without exposing secret values.
- Emit warnings for ambiguous or incomplete relationships.

### FR-4: Graph generation

- Convert analyzer output into the canonical graph schema in Section 9.
- Deduplicate nodes using stable repository-relative identifiers.
- Attach evidence to every inferred node and edge.
- Preserve confidence and derivation method for inferred relationships.
- Produce versioned JSON that the UI can render without analyzer-specific knowledge.

### FR-5: Visualization

- Render graphs of at least 250 nodes without blocking basic interaction on a modern laptop.
- Provide filters for Architecture, Product, and Files.
- Use distinct visual treatments for node types and inferred versus deterministic relationships.
- Make keyboard-accessible selection and textual relationship details available.

### FR-6: Explanation

- Generate deterministic template-based explanations when AI enrichment is unavailable.
- If AI enrichment is enabled, send only bounded graph neighborhoods and selected source excerpts.
- Require returned claims to reference supplied evidence IDs.
- Display the audience, confidence, and linked evidence for generated explanations.

### FR-7: Demos and evaluations

- Store graph snapshots for three recognizable public repositories in the project.
- Load demos without GitHub API access or AI inference.
- Maintain at least 20 repository questions with expected files or nodes.
- Report top-1 and top-3 retrieval accuracy.

## 9. Canonical graph schema

The graph is the contract between ingestion, analysis, enrichment, evaluation, and UI layers.

### Top-level object

```ts
type RepositoryGraph = {
  schemaVersion: "0.1";
  repository: {
    owner: string;
    name: string;
    url: string;
    defaultBranch: string;
    commitSha: string;
    analyzedAt: string;
    analysisMode: "deep" | "reduced" | "precomputed";
    limitations: string[];
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
  features: FeatureView[];
  explanations: Explanation[];
};
```

### Nodes

```ts
type NodeType =
  | "REPOSITORY"
  | "MODULE"
  | "ENDPOINT"
  | "SERVICE"
  | "DATA_STORE"
  | "EXTERNAL_DEPENDENCY"
  | "UI_SURFACE"
  | "FEATURE"
  | "FILE";

type Evidence = {
  id: string;
  path: string;
  startLine?: number;
  endLine?: number;
  commitSha: string;
  excerptHash?: string;
};

type GraphNode = {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  language?: string;
  framework?: string;
  confidence: number; // 0–1
  derivation: "parser" | "manifest" | "convention" | "ai" | "manual";
  evidence: Evidence[];
  metadata: Record<string, string | number | boolean | string[]>;
};
```

### Edges

```ts
type EdgeType =
  | "CONTAINS"
  | "IMPORTS"
  | "CALLS"
  | "ROUTES_TO"
  | "READS_FROM"
  | "WRITES_TO"
  | "DEPENDS_ON"
  | "IMPLEMENTS_FEATURE";

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  confidence: number;
  derivation: "parser" | "manifest" | "convention" | "ai" | "manual";
  evidence: Evidence[];
};
```

### Product and explanation projections

```ts
type FeatureView = {
  featureNodeId: string;
  journeyNodeIds: string[];
  summary: string;
  evidenceIds: string[];
};

type Explanation = {
  id: string;
  audience: "executive" | "product_manager" | "engineer";
  subjectNodeIds: string[];
  text: string;
  evidenceIds: string[];
  generatedBy: "template" | "ai";
};
```

### Schema rules

- IDs must be deterministic for the same repository commit.
- All non-container nodes and all inferred edges require evidence.
- AI output may add descriptions, feature hypotheses, or explanations; it may not overwrite parser-derived relationships.
- UI projections must retain references to canonical node, edge, and evidence IDs.
- The schema must be versioned before breaking changes are introduced.

## 10. Technical approach

```text
GitHub → ingestion → deterministic code intelligence → canonical product graph → interactive UI
                                                       ↘ bounded AI enrichment
```

### Proposed repository structure

```text
gitviz/
  apps/
    web/                  # Next.js / React UI
  services/
    analyzer/             # Python / FastAPI analysis service
  packages/
    schema/               # Shared versioned graph schema
  demo/
    snapshots/            # Precomputed repository graphs
  tests/
    fixtures/             # Parser fixtures and evaluation data
  docs/
    PRD.md
    ARCHITECTURE.md
    EVALS.md
    ROADMAP.md
  AGENTS.md
  README.md
```

### Architectural principles

- The canonical graph—not an AI response—is the system of record.
- Deterministic extractors run before optional AI enrichment.
- Every explanation is grounded in a small graph neighborhood and source evidence.
- Language and framework analyzers are adapters that emit a shared schema.
- Partial, honest results are preferable to confident unsupported claims.
- Precomputed demos keep the hosted product fast, reliable, and inexpensive.

## 11. Non-functional requirements

- **Performance:** first useful map in 60 seconds or less for the target demo size; precomputed demos in 3 seconds or less.
- **Reliability:** parser failure in one file must not fail the entire analysis.
- **Privacy:** do not retain repository contents beyond analysis unless explicitly required for a precomputed public demo.
- **Security:** never render source as executable HTML; sanitize labels and excerpts; do not log tokens or detected secret values.
- **Accessibility:** core graph information must also be available through keyboard-navigable textual details.
- **Observability:** capture stage timing, files considered/fetched/parsed, exclusions, warnings, and failure category.
- **Cost control:** bound GitHub requests, file bytes, model context, and enrichment calls per analysis.

## 12. MVP acceptance criteria

The MVP is complete when:

- A user can submit a valid public GitHub repository URL.
- GitViz generates or loads a versioned repository graph.
- Supported repositories show imports plus at least one additional detected relationship category when present.
- Architecture, Product Map, and Explain views render from the same graph.
- Selecting a node reveals connected nodes and linked source evidence.
- Executive, Product Manager, and Engineer explanations differ meaningfully in detail.
- Unsupported repositories receive an explicit reduced-intelligence result rather than a silent failure.
- Three precomputed demos work without live GitHub or model access.
- At least 20 evaluation questions run and report top-1/top-3 accuracy.
- No generated product or dependency claim is displayed without evidence.
- Known limitations and confidence are visible to the user.

## 13. Delivery plan

### Day 1 — reliable system of record

1. Establish the monorepo skeleton and canonical schema.
2. Implement URL normalization, GitHub tree ingestion, and exclusions.
3. Implement initial Python and JavaScript/TypeScript deterministic extractors.
4. Emit a validated graph JSON fixture.
5. Build the basic Architecture graph and evidence detail panel.

### Day 2 — credible product experience

1. Add Product Map projection and audience-specific explanations.
2. Add bounded optional AI enrichment with provenance validation.
3. Add three precomputed demos.
4. Add the evaluation harness and at least 20 known-answer questions.
5. Polish loading, partial-result, error, accessibility, and README states.

If time is constrained, cut live AI enrichment first. Do not cut provenance, deterministic analysis, or precomputed demos.

## 14. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| GitHub rate limits or large repository trees | Slow or failed live analysis | Strict bounds, caching, partial results, and precomputed demos |
| Framework conventions vary widely | Missing or incorrect relationships | Start with explicit supported patterns and label reduced intelligence |
| Graph becomes visually noisy | Users cannot form a mental model | Collapse file-level detail by default; progressive disclosure and filters |
| AI produces plausible unsupported claims | Loss of trust | Evidence-ID requirement; reject or label claims without valid provenance |
| Two-day scope expands | Incomplete, unreliable demo | Treat private repos, broad language support, and editing as non-goals |
| Public source contains malicious text | Prompt injection or unsafe rendering | Treat code as untrusted data, use structured prompts, sanitize output |

## 15. Open decisions

These decisions should be resolved during implementation without expanding MVP scope:

- Which three public repositories best demonstrate Python, TypeScript, and a mixed architecture?
- Which framework patterns are mandatory for the first deterministic adapters?
- What exact repository-size and byte limits preserve the 60-second target?
- Should live analysis run synchronously for the prototype or through a minimal job abstraction?
- Which graph library provides the best balance of polish, accessibility, and speed?

## 16. Post-MVP roadmap

Only consider these after the MVP acceptance criteria are met:

- Private repository access through a GitHub App.
- Saved analyses, refreshes, repository comparison, and change-impact diffs.
- More language and framework adapters.
- Jira and observability links.
- Team annotations and validated ownership metadata.
- Organization-level maps and cross-repository dependencies.

## 17. Product decisions log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-08-20 | Name the project GitViz | Clear connection to GitHub repository visualization |
| 2026-08-20 | Optimize the MVP for technical PM orientation | Provides one testable job instead of universal code understanding |
| 2026-08-20 | Make the graph the system of record | Enables deterministic analysis, explainability, and multiple UI projections |
| 2026-08-20 | Require file-level provenance | Trust is a core product requirement, not a later enhancement |
| 2026-08-20 | Prioritize Python and JavaScript/TypeScript | Constrains the two-day build while covering the proposed stack and common repos |
