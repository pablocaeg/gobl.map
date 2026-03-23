<img src="https://github.com/invopop/gobl/blob/main/gobl_logo_black_rgb.svg?raw=true" width="80" alt="GOBL Logo">

# gobl.map

Interactive visual explorer for [GOBL](https://gobl.org)'s tax regime coverage worldwide. Browse supported countries on a map, dive into tax categories and rates, compare regimes side by side, and discover where new contributions are needed.

**[Live demo →](https://pablocaeg.github.io/gobl.map/)**

## Features

### Views

- **World Map** - interactive map with zoom, pan, and country selection. Colour-coded by region with hatched patterns for pending PRs and countries needing contributions.
- **Table** - sortable list of all regimes showing standard VAT/GST rates, currencies, addon counts, and e-invoicing compliance status.
- **Format Matrix** - coverage grid for conversion formats (UBL, CII, FacturaE, CFDI, etc.) across all supported countries.

### Detail & Compare

- **Detail Panel** - click any supported country to see its tax categories, current and historical rates, tax identities, correction methods, addons, and links to source code.
- **Compare Mode** - select two countries and view their tax rates, categories, and addons side by side.
- **Code Examples** - minimal GOBL invoice JSON per country, ready to copy.

### Contribution Guides

- **77 country invoicing guides** covering B2G, B2B, and B2C e-invoicing compliance status (mandatory, upcoming, planned, not required).
- **Guide Panel** - for countries that need a GOBL regime, shows compliance requirements, technical details (format, infrastructure, authority, archiving, e-signature), and a direct link to contribute on GitHub.

### Filters & Navigation

- **Compliance Filters** - highlight countries that need contributions (red) or have open PRs in progress (amber). Clickable from both the top-bar controls and the stats bar counts.
- **Live PR Detection** - fetches open pull requests from [invopop/gobl](https://github.com/invopop/gobl) to show which regimes are actively being worked on.
- **Search** - find countries by name instantly.
- **URL Sharing** - deep-link to any country via URL hash (`#es`, `#de`).
- **Keyboard** - press `Escape` to close all panels and clear filters.

### Stats Bar

Top bar showing live counts: supported regimes, addons, PRs in progress, countries needing contribution, and per-region breakdowns. The "in progress" and "need contribution" counts are clickable to activate the corresponding map highlight.

## Data

All regime and addon data comes from the [GOBL](https://github.com/invopop/gobl) repository's `data/regimes/` and `data/addons/` directories. Currently includes **25 regimes** and **22 addons**.

Invoicing compliance guides are bundled in `src/lib/data/guides/` (**77 countries**) and serve as the single source of truth for compliance status across the app.

## Development

Requires Node.js 22+.

```sh
npm install
npm run sync-data   # copies regime/addon JSONs from ../gobl (expects ../gobl by default)
npm run dev          # starts dev server at localhost:5173
```

To sync from a different GOBL repo location:

```sh
npm run sync-data -- /path/to/gobl
```

### Type checking

```sh
npm run check
```

## Build & Deploy

```sh
npm run build
npm run preview   # preview the production build locally
```

### GitHub Pages (default)

A GitHub Action (`sync-and-deploy.yml`) runs weekly (Monday 00:00 UTC) and on every push to `main`. It:

1. Checks out the latest GOBL data via sparse checkout
2. Copies regime and addon JSONs into the project
3. Builds and deploys to GitHub Pages

To enable: **Settings → Pages → Source → GitHub Actions**.

### Netlify

A `netlify.toml` is included for one-click Netlify deployment.

## Project Structure

```
src/
├── routes/
│   ├── +layout.svelte       # topology loading, regime init, HTML loader removal
│   └── +page.svelte          # main page layout, view switching, global keybindings
├── lib/
│   ├── components/           # 20 Svelte 5 components
│   │   ├── WorldMap.svelte   # D3 + TopoJSON map rendering
│   │   ├── DetailPanel.svelte
│   │   ├── GuidePanel.svelte
│   │   ├── CompareView.svelte
│   │   ├── TableView.svelte
│   │   ├── FormatMatrix.svelte
│   │   ├── StatsBar.svelte
│   │   ├── ComplianceFilter.svelte
│   │   └── ...
│   ├── data/
│   │   ├── regimes/          # 25 regime JSONs (synced from GOBL)
│   │   ├── addons/           # 22 addon JSONs (synced from GOBL)
│   │   ├── guides/           # 77 country invoicing guide JSONs
│   │   ├── compliance.ts     # single source of truth for compliance data
│   │   └── regions.ts        # region → colour mapping
│   ├── stores/               # Svelte writable stores
│   │   ├── filters.ts        # view mode, highlight mode
│   │   ├── selection.ts      # selected country/guide, compare mode, URL hash sync
│   │   ├── topology.ts       # pre-fetched world topology
│   │   ├── regimes.ts        # regime data store
│   │   └── pending.ts        # pending PR regimes
│   └── utils/
│       ├── data-loader.ts    # regime/addon JSON loading
│       ├── pending-regimes.ts # GitHub API PR detection
│       ├── format.ts         # formatting helpers
│       └── clipboard.ts      # copy-to-clipboard utility
└── app.html                  # HTML shell with inline GOBL logo loader
```

## Stack

- **[SvelteKit](https://svelte.dev/)** with Svelte 5 runes (`$state`, `$derived`, `$props`)
- **[D3.js](https://d3js.org/)** (d3-geo, d3-selection, d3-zoom) for map rendering
- **[Tailwind CSS v4](https://tailwindcss.com/)** for styling
- **[TypeScript](https://www.typescriptlang.org/)** throughout
- **[TopoJSON](https://github.com/topojson/topojson)** for efficient world geometry
- **[flag-icons](https://flagicons.lipis.dev/)** for country flags

## Contributing

Contributions are welcome. If you'd like to add a new tax regime to GOBL, check the map for countries marked "Needs contribution" and head to the [GOBL repository](https://github.com/invopop/gobl) to get started.

## License

[Apache-2.0](LICENSE)
