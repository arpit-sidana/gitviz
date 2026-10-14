# GitViz

Explore what a public repository does, how its capabilities connect to code, and how the project has evolved.

**GitHub Pages:** [arpit-sidana.github.io/gitviz](https://arpit-sidana.github.io/gitviz/)

**Source:** [arpit-sidana/gitviz](https://github.com/arpit-sidana/gitviz)

**Previous hosting:** [ChatGPT Sites prototype](https://gitviz.arpitsidana.chatgpt.site) (legacy version)

## Work in progress

This prototype provides three offline demo projects: [Cal.diy (formerly the Cal.com repository)](https://github.com/calcom/cal.diy), [Saleor](https://github.com/saleor/saleor), and [Dify](https://github.com/langgenius/dify). Live ingestion of arbitrary repositories is still in development.

- **Overview:** product capabilities and entry points.
- **Product Flow:** numbered journeys through implementation components.
- **Architecture:** labeled connections, logical boundaries, repository Compose services, zoom, source inspection, and explicitly marked deployment assumptions.
- **Evolution:** feature themes in the Product view; linked PRs, diffs, file counts, and plain-English summaries in the Git view.
- **Sources & limits:** pinned source locations and honest coverage limitations.

Choose **Summary**, **How it works**, or **Source files** to control the information shown. Light/dark mode initially follows the browser; an explicit toggle is saved on your device.

## Evidence and limitations

The previous illustrative commit IDs and history have been replaced with snapshots captured from GitHub. The source tree verifies file paths. PR dates and change counts come from the public API. Product labels, architecture connections, and feature groupings are curated interpretations; they are not a runtime trace or a complete call graph. Merge dates are not launch dates. No measured evaluation pass rate is claimed.

Snapshots live in `lib/snapshots/demos.json`. `scripts/refresh-demos.mjs` retrieves public metadata and selected deployment configuration at build time. Browsing the demos requires no GitHub credentials or model inference. The original prototype data in `lib/demo-data.ts` is used only as a curation seed, not served to visitors.

## Development and deployment

Uses Node 24.13.0 (see `.nvmrc`) and its bundled npm 11.6.2 so local and GitHub installations resolve the lockfile consistently.

```sh
npm ci
npm run dev
npm test
npm run typecheck
GITHUB_PAGES=true npm run build
```

The static export is written to `out/` with the `/gitviz` asset base path for GitHub Pages. `.github/workflows/pages.yml` runs the tests, type check, and export on GitHub. Deployment depends on all validation succeeding. Pull requests validate without deploying. Pages is configured to use GitHub Actions.

To deliberately refresh the public snapshots:

```sh
npm run refresh:demos
```

Review source selection and summaries before committing the generated data. The previous Sites remote is retained; it is not automatically deployed by this workflow.

See the [PRD](docs/PRD.md) for scope and product decisions.

## License

[MIT](LICENSE)
