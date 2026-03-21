<img src="https://github.com/invopop/gobl/blob/main/gobl_logo_black_rgb.svg?raw=true" width="80" alt="GOBL Logo">

# gobl.map

**GOBL Map** is an interactive world map showing [GOBL](https://gobl.org) tax regime coverage. Explore supported countries, their tax categories, rates, addons, identity types, and more.

A standalone demo is available at the deployed site (see Deployment below).

## Features

- **Interactive World Map** — D3.js SVG map with Natural Earth projection, hover tooltips, click-to-explore details, zoom and pan.
- **Table View** — Sortable grid of all regimes by name, standard rate, currency, categories, and addon count.
- **Format Coverage Matrix** — Grid showing which conversion formats (UBL, CII, FacturaE, FatturaPA, CFDI, etc.) are available per country.
- **Detail Panel** — Tax categories with current and historical rates, addons, identity types, correction methods, and links to official sources.
- **Comparison Mode** — Side-by-side comparison of two countries' tax rates, addons, and general info.
- **Code Examples** — Minimal GOBL invoice JSON snippet per country, ready to copy.
- **Search** — Find countries by name or code.
- **Shareable URLs** — Hash-based routing (`#es`, `#de`) for direct linking to a country.

## Data

Regime and addon data is sourced from the [GOBL repository](https://github.com/invopop/gobl) (`data/regimes/` and `data/addons/`). A GitHub Action syncs fresh data weekly and on every push.

## Development

### Installation

Clone this repository from GitHub, then run from within its directory:

```sh
npm install
```

### Sync data

Sync the latest regime and addon JSON data from a local clone of the GOBL repo (expected at `../gobl`):

```sh
npm run sync-data
```

### Run in watch mode

```sh
npm run dev
```

This uses `vite` to run a development web server with HMR on http://localhost:5173.

### Build

```sh
npm run build
```

This uses `vite` to build and write an optimized production build to the `build` directory.

### Preview production build

```sh
npm run preview
```

## Deployment

The included GitHub Action (`.github/workflows/sync-and-deploy.yml`) handles:

1. Fetching latest regime/addon data from `invopop/gobl`
2. Building the static site
3. Deploying to GitHub Pages

To activate: go to **Settings → Pages → Source → GitHub Actions**.

For a custom domain, set `BASE_PATH=""` in the workflow environment.

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) with static adapter
- [D3.js](https://d3js.org/) (d3-geo, d3-zoom)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [TopoJSON](https://github.com/topojson/topojson) world atlas
- TypeScript

## License

GOBL Map is licensed under the [Apache-2.0 License](LICENSE).
