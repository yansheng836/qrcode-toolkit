# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QRCode Toolkit — a pure frontend, client-side QR code generator. No backend required.

## How to Run

Open `index.html` directly in a browser, or use a local server (e.g., VS Code Live Server) for development.

## Tech Stack

- Pure HTML/CSS/JS, no build tools
- awesome-qr@2.1.0 via CDN (`https://unpkg.com/awesome-qr@2.1.0/dist/awesome-qr.js`)
- Global variable: `AwesomeQR`

## Architecture

```
index.html          — Main page with left-right split layout
css/style.css       — All styles (CSS variables for theming)
js/utils.js         — Utility functions: fileToDataURL, downloadFile, debounce
js/themes.js        — Theme system: light/dark/gradient, localStorage persistence
js/qrcode.js        — QR code generation wrapper around awesome-qr
js/app.js           — Main controller: content types, style controls, preview, export
```

## Key Design Decisions

- CSS variables for theme switching (3 themes: light, dark, gradient)
- awesome-qr loaded via CDN, wrapped in `generateQR(text, options)` interface
- Gradient backgrounds applied via canvas post-processing (`source-atop` compositing)
- Export: PNG/JPG from canvas, SVG wraps raster in SVG container
- Debounced input → real-time preview updates (300ms)
