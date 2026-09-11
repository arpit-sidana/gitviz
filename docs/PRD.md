# GitViz Product Requirements Document

- **Status:** Draft for discussion
- **Version:** 0.2
- **Target:** Evidence-backed repository understanding prototype
- **Product owner:** Arpit Sidana
- **Last updated:** August 21, 2026

## 1. Mission

GitViz turns an unfamiliar public GitHub repository into an interactive, evidence-backed explanation of the product it powers, the code that implements its capabilities, the architecture connecting those components, and the way the project has evolved.

**Mission statement:** Help a technical person build a trustworthy mental model of an unfamiliar product repository in minutes instead of days.

GitViz is not a code-generation tool, a generic AI code reviewer, or a change forecaster. It is a product-and-architecture orientation tool.

## 2. Business problem

When a person joins a team, evaluates a company, scopes a product change, or prepares for a technical discussion, they must reconstruct a repository's mental model manually. They search files, follow routes, trace imports, inspect database models, read configuration, and ask engineers for context.

The cost is not only time. Manual orientation produces inconsistent answers, hides evidence, and makes it difficult to connect business capabilities to technical implementation.

GitViz makes that orientation repeatable:

```text
Repository → product capabilities → implementation flow → architecture → project evolution
```

## 3. Audience and decisions

### Audience

GitViz is audience-neutral. Anyone who needs to understand an unfamiliar public repository—an executive, PM, engineer, manager, candidate, or curious developer—starts from the same evidence. The interface does not assign a persona or force a role before showing the repository.

### Decisions GitViz supports

- What does this product do?
- Where is a capability implemented?
- What is the end-to-end interaction flow for that capability?
- Which services, data stores, and external systems are involved?
- What parts of the project have changed recently?
- Which source files should I read or discuss next?

### Depth selector

The user controls how much detail to see. A depth choice is a presentation setting across all tabs, not a persona or a separate interpretation of the repository:

- **Orientation:** purpose, major capabilities, boundaries, coverage, and high-level evolution.
- **Trace:** end-to-end capability flows and the components connected to them.
- **Inspect:** files, symbols, lines, commits, relationships, provenance, and analysis limitations.

Orientation is the default. Users can move between depths at any time; GitViz never assumes whether they are an executive, PM, engineer, or another kind of reader.

## 4. Product vocabulary

### Product capability

A recognizable thing the product lets a user or operator do, such as create a booking, sign a document, run a survey, process a payment, invite a teammate, or view analytics.

### Implementation flow

The evidence-backed path from a user-facing entry point through routes, controllers, services, domain modules, data models, jobs, and external integrations.

### Architecture

The structural relationship between UI surfaces, APIs, services, modules, data stores, queues, deployment units, and external dependencies.

### Evolution

Historical facts derived from commit and release metadata: which capabilities and modules changed, when they changed, and what files or commits support that observation. Evolution is not a prediction of what will change next.

## 5. Core interaction flow

1. The user lands on GitViz and sees a repository URL field plus three curated examples.
2. The user pastes a public GitHub URL.
3. GitViz validates the repository and displays bounded ingestion progress.
4. GitViz opens an overview with the repository purpose, detected stack, supported-analysis status, and primary capabilities.
5. The user selects a capability, such as **Checkout** or **Document signing**.
6. GitViz highlights the implementation flow and opens an evidence drawer with source files, symbols, commit SHA, and confidence.
7. The user switches to Architecture to inspect connected components and external systems.
8. The user switches to Evolution to inspect recent changes by capability, module, time period, or release.
9. The user selects Orientation, Trace, or Inspect to control the level of detail shown across the same evidence.
10. The user opens Evaluation to ask a curated repository question and inspect GitViz's answer, evidence, and limitations.

## 6. Product surfaces

### Overview

Answers **“What is this?”** A static-first summary that becomes interactive when a user selects a capability. It shows the repository purpose, primary capabilities, detected stack, analysis coverage, limitations, and recent evolution summary.

### Product Flow

Answers **“How does a capability work end to end?”** Selecting a capability reveals its evidence-backed implementation path:

```text
UI surface → route/endpoint → service/domain module → data model/store → job/integration
```

Users can expand, collapse, filter, and open source evidence at every step.

### Architecture

Answers **“What components and boundaries make up the system?”** It is the deepest structural view: an interactive graph with pan, zoom, selection, type filters, relationship filters, and textual access to the same information for accessibility.

### Evolution

Answers **“What has changed?”** It is an interactive timeline and change-concentration view based on recent commit history and releases when present. It displays historical evidence and uncertainty; it does not label future risk or forecast future changes.

### Evaluation

Answers **“How well-supported is this understanding?”** It lets a user choose or type a repository-understanding question, then inspect GitViz's answer, answered node and relationship IDs, supporting files/lines/commits, confidence, analysis method, and missing evidence.

Evaluation is both a user-facing trust feature and the visible surface for the internal evaluation dataset.

### External visualization tools

Lucid, Figma, Miro, or similar export/integration is post-MVP. The MVP should produce a polished interactive experience inside GitViz and retain a versioned graph export that can support future integrations.

## 7. Scope

### MVP in scope

- Public GitHub repositories only.
- Repository tree, selected text files, metadata, and bounded commit-history ingestion.
- Tier-one deterministic analysis for TypeScript/JavaScript and Python.
- Reduced-intelligence structure and metadata analysis for other languages.
- Overview, Product Flow, Architecture, Evolution, and Evaluation surfaces.
- A user-controlled Orientation/Trace/Inspect depth selector applied across every tab.
- File- and commit-level provenance for every material claim.
- Three curated precomputed demonstrations.
- A 12-check evaluation dataset curated before launch.
- Versioned graph JSON export.

### Explicit non-goals

- Forecasting what will change next.
- Guaranteed impact analysis.
- Private repositories or GitHub App authentication.
- Code editing, pull-request generation, or IDE behavior.
- Runtime tracing or production observability.
- Organization-wide repository search.
- Universal language/framework understanding.
- Lucid/Figma/Miro integrations in the MVP.
- Billing, teams, permissions, or enterprise multi-tenancy.
- Sending an entire repository to a model.

## 8. Supported languages and repositories

### Tier-one support

TypeScript/JavaScript and Python are the first supported analysis families. This is a prioritization decision, not a claim that they represent every public repository:

- GitHub's 2025 Octoverse analysis placed TypeScript first, Python second, and JavaScript third by platform usage and contributor activity.
- TypeScript and JavaScript share a web-product analyzer family.
- Both ecosystems expose common route, module, manifest, and framework conventions.
- Python is common in APIs, data products, automation, and backends represented by target companies.
- The languages match the proposed React/Next.js and Python analyzer stack.

GitViz must display the analysis tier prominently. Unsupported languages should still get file structure, manifests, configuration, and commit history where possible, but must be labeled reduced intelligence.

### Repository selection rule

A repository is suitable for a demo when it has a recognizable product with visible capabilities, multiple implementation layers, active public history, meaningful documentation, enough size to demonstrate depth without making the map uninspectable, and a language/architecture that tests a deliberate product claim.

Popularity is a screening signal, not the product's definition of quality.

## 9. Analysis signals

The following signals are required because the user promise is product understanding, not only dependency visualization.

### Product and entry-point signals

- UI pages, screens, routes, and navigation.
- API routes, GraphQL operations, commands, and webhooks.
- Framework entry points and application bootstrap.
- Route-to-controller and route-to-page relationships.

### Domain and data signals

- Services, use cases, and domain modules.
- ORM schemas, models, repositories, and migrations.
- Read/write relationships to data stores.
- Authentication, authorization, roles, and permissions.
- Feature flags and configuration-driven capability switches.

### System and integration signals

- Imports and calls.
- Package manifests and external dependencies.
- Background jobs, queues, events, and scheduled tasks.
- External APIs, payment systems, email, storage, analytics, and identity providers.
- Docker, deployment, infrastructure, and environment configuration without exposing secrets.
- OpenAPI and other explicit interface specifications.

### Evolution signals

- Commit metadata for a bounded window, initially the last 90 days or 250 commits.
- Commit-to-file and commit-to-graph-node mapping.
- Release and tag metadata when present.
- Additions, removals, and change concentration by capability/module.
- Commit-message themes shown as evidence, not as authoritative product strategy.

## 10. Canonical graph contract

The graph is the system of record between ingestion, analysis, evolution, evaluation, and UI.

```ts
type RepositoryGraph = {
  schemaVersion: "0.2";
  repository: {
    owner: string;
    name: string;
    url: string;
    defaultBranch: string;
    commitSha: string;
    analyzedAt: string;
    analysisTier: "tier-one" | "reduced" | "precomputed";
    limitations: string[];
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
  capabilities: CapabilityView[];
  evolution: EvolutionEvent[];
  evaluations: EvaluationResult[];
};
```

Each node and edge has a stable ID, type, confidence, derivation method, and evidence references. Evidence includes repository-relative path, optional line range, commit SHA, and a safe excerpt hash.

Principal node types:

```text
REPOSITORY, FILE, UI_SURFACE, ENDPOINT, MODULE, SERVICE,
DATA_STORE, JOB, EVENT, EXTERNAL_DEPENDENCY, FEATURE
```

Principal edge types:

```text
CONTAINS, IMPORTS, CALLS, ROUTES_TO, READS_FROM, WRITES_TO,
EMITS, CONSUMES, DEPENDS_ON, IMPLEMENTS_CAPABILITY, CHANGED_IN
```

AI may enrich descriptions and capability hypotheses, but may not overwrite parser-derived relationships. Unsupported or unevidenced claims must be rejected or clearly labeled.

## 11. Evaluation dataset and launch checks

The evaluation dataset is an internal quality fixture and a user-facing proof surface. It protects against attractive but incorrect maps and catches regressions as analyzers change.

### Dataset curation process

Before launch, for each selected demo:

1. A human establishes ground-truth capability flows by reading the repository and documentation.
2. Each question is tied to expected nodes, edges, files, and evidence.
3. Questions cover Orientation, Trace, and Inspect depth so the fixture tests understanding at each level.
4. Ambiguous questions are removed rather than scored as failures.
5. The fixture is versioned with the repository snapshot SHA.
6. Results report retrieval, relationship, provenance, and unsupported-claim behavior.

### Twelve launch checks

Four checks per demo:

1. Identify the repository's primary product purpose.
2. Locate one named product capability in source files.
3. Trace one capability from entry point to service/module to persistence or integration.
4. Identify a recent evolution theme and show its supporting commits/files.

The checks are not intended to prove universal code understanding. They prove that the chosen demos support GitViz's specific comprehension job.

### Evaluation metrics

- **Capability retrieval:** expected capability node or file appears in top three results.
- **Flow correctness:** expected relationships appear in the traced path.
- **Evidence validity:** every answer cites valid repository evidence.
- **Evolution validity:** historical claims cite commits/files in the analyzed window.
- **Unsupported behavior:** GitViz labels missing or unsupported evidence instead of guessing.

## 12. North star and success metrics

### North-star metric

**Evidence-backed comprehension success** is the percentage of first-time test sessions in which a participant answers at least two of three role-relevant repository questions correctly within five minutes and opens the supporting evidence.

Initial target: 4 of 5 participants in a moderated prototype test. Treat this as a directional launch gate, not a statistically stable product benchmark.

### Supporting outcomes

| Metric | Definition | Initial target |
| --- | --- | ---: |
| Time to first evidence-backed answer | Time from analysis-ready state to first correct answer with opened evidence | ≤ 5 minutes median |
| Useful-map availability | Supported analyses that return a navigable result | ≥ 90% |
| Capability retrieval | Curated questions with expected capability/file in top three | ≥ 75% |
| Flow correctness | Curated questions whose expected path is represented correctly | ≥ 70% |
| Evolution validity | Historical answers supported by correct commits/files | ≥ 90% |

### Trust and experience guardrails

- 100% of generated claims link to evidence or are labeled unsupported.
- ≤ 10% unsupported or materially incorrect claims in manual review.
- First useful map for supported demo-sized repositories in ≤ 60 seconds.
- Precomputed demo load succeeds 100% of the time during the launch review.
- No source secrets or credentials are exposed in output, logs, or model context.

## 13. Technical approach

```text
GitHub → bounded ingestion → deterministic analyzers → canonical graph
                                              ↘ bounded enrichment
canonical graph → Product Flow / Architecture / Evolution / Evaluation
```

Deterministic analysis runs first. AI is optional and receives only bounded graph neighborhoods, selected excerpts, and evidence IDs.

The initial project structure remains:

```text
apps/web/
services/analyzer/
packages/schema/
demo/snapshots/
tests/fixtures/
docs/
```

## 14. Launch demonstrations

### 1. Cal.com/Cal.diy — scheduling workflows

Clear end-to-end TypeScript product flow: booking pages, availability, calendar integrations, authentication, payments, notifications, and scheduling data. It is the best first demonstration because a PM can understand the product immediately and click through a visible user journey.

### 2. Saleor — commerce platform

Python and GraphQL backend with products, checkout, payments, orders, promotions, and customer flows. It proves GitViz can explain backend-heavy product architecture and aligns with commerce/payments companies such as Shopify, Stripe, Block, DoorDash, Instacart, and Uber.

### 3. Dify — AI application platform

Technical product surface spanning visual workflows, RAG pipelines, agents, model/provider management, observability, plugins, APIs, and deployment. It provides the AI/infra-heavy example for target companies such as OpenAI, Anthropic, Datadog, CrowdStrike, NVIDIA, and AI labs while remaining understandable through a visible workflow canvas.

### Why these three

Together they provide a clear UI/workflow product, a Python/API-first business backend, and an AI/infra-heavy platform with a visual product surface. The domains are scheduling, commerce, and AI application infrastructure, giving executives and PMs an understandable story while preserving technical depth for engineers.

Documenso remains a strong fourth candidate because document creation and signing are exceptionally easy to explain, but it is less aligned to the target-company breadth than Saleor. Cal.com/Cal.diy remains a useful alternate scheduling demo if the first UI-focused example needs a more complex integration graph.

## 15. Delivery plan

### Phase 1 — graph and evidence

1. Freeze the schema and supported analyzer matrix.
2. Implement bounded GitHub tree, file, and commit ingestion.
3. Implement TypeScript/JavaScript and Python structural analyzers.
4. Produce one validated graph snapshot with evidence.

### Phase 2 — interaction prototype

1. Build Overview and Product Flow.
2. Build Architecture graph and evidence drawer.
3. Add depth-selector behavior across tabs.
4. Add Evolution timeline from the commit window.

### Phase 3 — proof and evaluation

1. Add Evaluation surface.
2. Curate the 12 launch checks against the three demo snapshots.
3. Add precomputed demos and reduced-intelligence states.
4. Run the moderated comprehension test.

If time is constrained, cut AI enrichment and external visualization integrations first. Do not cut evidence, Evaluation, or the deterministic graph.

## 16. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Product capabilities are difficult to infer from code | Label capability hypotheses, cite evidence, and let users inspect the flow |
| Graph is visually overwhelming | Progressive disclosure, filters, capability-first defaults, and textual details |
| Commit messages overstate product intent | Treat commits as historical evidence, not strategy truth |
| Unsupported languages reduce trust | Display analysis tier and limitations prominently |
| Large repositories exceed prototype bounds | Precompute snapshots, cap files/bytes/commits, and return partial results |
| AI generates plausible but unsupported summaries | Require evidence IDs and reject unsupported claims |
| Evaluation fixtures become stale | Pin each fixture to a repository commit SHA and refresh deliberately |
| External-tool integrations distract from core value | Keep graph export stable and defer integrations |

## 17. Open decisions

- Should Evolution use 90 days, 250 commits, or an adaptive repository-size bound?
- Which framework conventions are guaranteed in Tier-one analysis?
- Should the first Evaluation surface use only curated questions or allow free-form questions?
- Should Dify be the third launch demo, or should Langflow be used as a smaller visual-AI fallback?
- What graph interaction library best supports accessibility and 250-node performance?
- Which target-company interview participants can validate the five-minute comprehension task?

## 18. Product decisions log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-08-21 | Remove forecasting language | GitViz explains current structure and historical evolution; it does not predict future changes |
| 2026-08-21 | Make Product Flow the primary interaction | Product capabilities are easier to understand when traced into implementation |
| 2026-08-21 | Replace Explain with Evaluation | Trust requires inspectable answers, evidence, and measurable quality checks |
| 2026-08-21 | Add commit-history ingestion | Project evolution is part of repository understanding and can be grounded in historical facts |
| 2026-08-21 | Support TypeScript/JavaScript and Python first | Strong GitHub usage signal, web-product coverage, mature conventions, and manageable analyzer scope |
| 2026-08-21 | Defer Lucid/Figma/Miro integrations | The core interactive graph must prove value before external visualization work |
| 2026-08-21 | Launch with Cal.com/Cal.diy, Saleor, and Dify | They provide understandable breadth across UI workflows, business APIs, and AI/infra-heavy visual systems |
| 2026-08-22 | Replace persona/role framing with a user-controlled depth selector | The tabs should explain what they do while letting each reader choose how deeply to explore |
| 2026-09-11 | Ship the interaction prototype with precomputed evidence snapshots before live ingestion | This validates the comprehension experience while deterministic analyzers are still being built |
