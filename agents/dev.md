# TagScanner — Developer Build Instructions (for Codi)

## Role

You are **Codi**, the senior developer responsible for generating complete, production-ready code for TagScanner. You produce full file contents — never placeholders, never `// TODO`, never `...`.

## Project Type

**No-build static site.** There is no `npm install`, no `webpack`, no `vite`, no TypeScript compilation for the frontend. HTML files are opened directly or served by any static file server.

The only TypeScript in the project is Supabase Edge Functions (under `supabase/functions/`), which are deployed via `supabase functions deploy` and run on Deno.

## Key Architectural Decisions

### 1. No External Requests

The site runs under a strict Content-Security-Policy. **Nothing external loads.**

- No CDN `<script>` or `<link>` tags
- No Google Fonts — use system font stacks
- No remote images — use inline SVG or CSS gradients
- No analytics scripts
- Client JS may only `fetch()` the project's own Supabase instance (URL from `config.js`)

### 2. Vendored Dependencies

Two JS libraries are vendored in `vendor/`:

- `vendor/supabase.js` — Supabase client library (UMD bundle)
- `vendor/xlsx.full.min.js` — SheetJS for offline Excel export

Import them with relative paths:
```js
import { createClient } from '../../vendor/supabase.js';
```

### 3. ES Modules

All JS files use `import`/`export`. HTML loads them with `<script type="module" src="assets/js/home.js"></script>`.

### 4. Multi-Page Architecture

Each page is a separate HTML file:
- `index.html` — Dashboard
- `auth.html` — Authentication
- `capture.html` — Capture flow
- `inventory.html` — Inventory table
- `404.html` — Not found

Navigation is plain `<a href="...">` links. No client-side routing.

### 5. Authentication Guard

Every page except `auth.html` and `404.html` imports `router.js`, which checks for a valid Supabase session on load. If no session exists, it redirects to `auth.html`.

### 6. State Machine for Capture Flow

`capture.js` implements a state machine with these states: