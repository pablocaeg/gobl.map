<img src="https://github.com/invopop/gobl/blob/main/gobl_logo_black_rgb.svg?raw=true" width="80" alt="GOBL Logo">

# gobl.map

Visual overview of [GOBL](https://gobl.org)'s tax regime coverage. See which countries are supported, explore their tax categories, rates, addons, and compare regimes side by side.

Data is pulled directly from the GOBL repo's `data/regimes/` and `data/addons/` directories.

## What's in here

- World map (D3.js) with country details on click
- Sortable table of all regimes
- Format coverage matrix (UBL, CII, FacturaE, CFDI, etc.)
- Side-by-side regime comparison
- Minimal GOBL invoice code examples per country
- Historical rate changes
- Search, hash-based URLs for sharing (`#es`, `#de`)

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

A GitHub Action (`.github/workflows/sync-and-deploy.yml`) syncs the latest data from `invopop/gobl` weekly and deploys to GitHub Pages. To set it up: **Settings → Pages → Source → GitHub Actions**.

## Stack

SvelteKit, D3.js, Tailwind CSS v4, TypeScript. Follows the same patterns as [gobl.builder](https://github.com/invopop/gobl.builder).

## License

[Apache-2.0](LICENSE)
