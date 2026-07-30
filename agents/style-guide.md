# TagScanner — Style Guide

## Code Conventions

### General

- **No build tools.** Everything runs as-is in the browser.
- **ES modules only.** Use `<script type="module">` in HTML. Use `import`/`export` in JS files.
- **No external requests.** Zero CDN scripts, fonts, images, or API calls from client code (except to the project's own Supabase instance).
- **Relative paths only.** Never use absolute paths starting with `/`. Always use relative paths like `assets/css/variables.css` or `../vendor/supabase.js`.

### HTML

- Use semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<article>`, `<footer>`).
- One page per `.html` file — no SPA routing.
- All pages include the same CSS files in the same order:
  1. `assets/css/variables.css`
  2. `assets/css/reset.css`
  3. `assets/css/base.css`
  4. `assets/css/layout.css`
  5. `assets/css/components.css`
  6. `assets/css/animations.css`
  7. Page-specific CSS (e.g., `assets/css/home.css`)
- IDs are for JS hooks (`id="capture-form"`). Classes are for styling (`.glass-card`).
- Use `data-*` attributes for JS state (`data-step="2"`, `data-category="servers"`).
- Keep inline styles to absolute minimum — prefer classes.

### CSS

- **CSS custom properties** defined in `variables.css` — never hardcode colors, spacing, or fonts.
- **BEM-lite naming**: `.component`, `.component-element`, `.component--modifier`. No deep nesting.
- **Mobile-first**: Base styles are for small screens. Use `min-width` media queries to layer on larger screen styles.
- **No `!important`** unless overriding third-party styles.
- Class name examples:
  - `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-lg`
  - `.card`, `.glass-card`, `.card-header`, `.card-body`
  - `.input`, `.input-group`, `.input-label`
  - `.table`, `.table-header`, `.table-row`, `.table-cell`
  - `.toast`, `.toast--success`, `.toast--error`
  - `.progress-dots`, `.progress-dot`, `.progress-dot--active`, `.progress-dot--completed`
- Use `rem` for font sizes and spacing. Use `px` for borders, shadows, and fine details.
- Transitions: default `0.2s ease`. Never exceed `0.4s`.

### JavaScript

- **Vanilla JS only.** No jQuery, no frameworks.
- **ES2020 features** are fine: optional chaining (`?.`), nullish coalescing (`??`), `Promise.allSettled`, dynamic `import()`.
- **Module pattern**: Each file exports named functions/constants. No default exports.
- **No global variables.** Everything is scoped to modules.
- **DOM queries**: Use `document.querySelector` / `document.querySelectorAll`. Cache references.
- **Event delegation**: Prefer attaching one listener to a parent over many to children.
- **Error handling**: Wrap all async operations in try/catch. Show user-friendly errors via `toast.js`. Log details to `console.error`.
- **Naming**:
  - Functions: `camelCase` verbs — `fetchCaptures()`, `showToast()`, `handleSubmit()`
  - Constants: `UPPER_SNAKE_CASE` — `SUPABASE_URL`, `MAX_FILE_SIZE`
  - DOM elements: prefix with `$` — `const $form = document.querySelector('#capture-form')`
  - Booleans: prefix with `is`/`has`/`should` — `isLoading`, `hasCamera`
- **No `var`.** Use `const` by default, `let` when reassignment is needed.
- **Template literals** for HTML generation. Sanitize user input before inserting into DOM.
- **Async/await** over `.then()` chains.

### File Organization

- One concern per file. Don't mix camera logic with AI extraction logic.
- `config.js` is the single source of truth for Supabase credentials.
- `supabase-client.js` is the single place the Supabase client is created.
- Page-specific JS files (e.g., `home.js`, `capture.js`) are entry points loaded by their respective HTML pages.
- Shared utilities go in `utils.js`, `toast.js`, `icons.js`.

### Supabase Edge Functions

- Written in TypeScript (Deno runtime).
- Always validate input — never trust client data.
- Always return proper HTTP status codes and JSON responses.
- Use `corsHeaders` for all responses.
- Access secrets via `Deno.env.get('SECRET_NAME')`.
- Never log secrets or full tokens.

### Git

- Commit messages: imperative present tense — "Add capture flow", "Fix auth redirect".
- Keep commits focused — one logical change per commit.
- Never commit `.env` files. Use `.env.example` as a template.

## Design Tokens Quick Reference

| Token | Value |
|---|---|
| Background | `#0A0A0F` |
| Surface | `#12121A` |
| Accent | `#00FF88` |
| Text primary | `#E8E8ED` |
| Text secondary | `#8888A0` |
| Error | `#FF4466` |
| Warning | `#FFAA00` |
| Border radius (default) | `10px` |
| Font display | `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` |
| Font mono | `ui-monospace, 'Cascadia Code', 'SF Mono', 'Courier New', monospace` |