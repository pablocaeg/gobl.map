<img src="https://github.com/invopop/gobl/blob/main/gobl_logo_black_rgb.svg?raw=true" width="80" alt="GOBL Logo">

# gobl.map

Visual overview of [GOBL](https://gobl.org)'s tax regime coverage. See which countries are supported, explore their tax categories, rates, addons, and compare regimes side by side.

**[Live demo →](https://pablocaeg.github.io/gobl.map/)**

Data comes from the GOBL repo's `data/regimes/` and `data/addons/` directories and is synced weekly via GitHub Actions.

## Features

- **Map** — interactive world map with country details on click, zoom and pan
- **Table** — sortable list of all regimes with standard rates, currencies, addon counts
- **Formats** — coverage matrix for conversion formats (UBL, CII, FacturaE, CFDI, etc.)
- **Compare** — pick two countries and see their tax rates and addons side by side
- **Detail panel** — tax categories, current and historical rates, identities, corrections, source links
- **Code examples** — minimal GOBL invoice JSON per country, ready to copy
- **Search & sharing** — find countries by name, share via URL hash (`#es`, `#de`)

## Development

```sh
npm install
npm run sync-data   # copies regime/addon JSONs from ../gobl
npm run dev
```

## Build & deploy

```sh
npm run build
```

The GitHub Action syncs the latest data from `invopop/gobl` weekly and deploys to GitHub Pages. To set it up: **Settings → Pages → Source → GitHub Actions**.

Also includes a `netlify.toml` for Netlify deployment.

## Stack

SvelteKit, D3.js, Tailwind CSS v4, TypeScript. Follows the same patterns as [gobl.builder](https://github.com/invopop/gobl.builder).

## License

[Apache-2.0](LICENSE)
