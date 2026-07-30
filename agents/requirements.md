# TagScanner — Requirements Document (for Reqi)

## Product Overview

TagScanner is a mobile-first web application designed for IT Asset Disposition (ITAD) teams. It enables field technicians to rapidly catalog equipment by photographing asset tags, using AI to extract model and serial numbers, and syncing results to a shared Microsoft Excel spreadsheet.

## Problem Statement

ITAD technicians currently record equipment details manually — typing serial numbers into spreadsheets by hand, often from hard-to-read tags in poorly lit server rooms. This process is:

- **Slow**: 45–90 seconds per device
- **Error-prone**: Typos in serial numbers cause downstream tracking failures
- **Tedious**: Hundreds of devices per job site

## Solution

TagScanner reduces per-device capture time to ~15 seconds:

1. Select equipment category
2. Enter basic details (type, make)
3. Photograph the asset tag
4. AI extracts model and serial number
5. Technician reviews and confirms
6. Data syncs to Excel automatically

## Target Users

- **Primary**: ITAD field technicians (mobile, on-site)
- **Secondary**: ITAD project managers (desktop, reviewing inventory)

## Functional Requirements

### Authentication (FR-01)

- FR-01.1: Users can sign up with email and password
- FR-01.2: Users can sign in with email and password
- FR-01.3: Users can sign out
- FR-01.4: Unauthenticated users are redirected to the sign-in page
- FR-01.5: Sessions persist across page reloads (via Supabase token in localStorage)

### Dashboard (FR-02)

- FR-02.1: Display total capture count for the authenticated user
- FR-02.2: Display today's capture count
- FR-02.3: Show the 5 most recent captures with timestamp, make, model
- FR-02.4: Provide prominent navigation to "Start Capture" and "View Inventory"

### Capture Flow (FR-03)

- FR-03.1: Display a 5-step progress indicator
- FR-03.2: **Step 1 — Category**: Present 4 category cards (Laptops/Desktops, Servers, Drives, Network). Only "Laptops/Desktops" is active; others show "Coming Soon"
- FR-03.3: **Step 2 — Details**: Collect device type (Desktop/Laptop dropdown), internal label (text input), and make (dropdown with common manufacturers)
- FR-03.4: **Step 3 — Photo**: Show live camera preview via `getUserMedia`. Provide a capture button. Fall back to file input if camera access is denied
- FR-03.5: **Step 4 — Processing**: Upload photo to Supabase Storage. Call the `extract-tag` Edge Function. Display loading animation. Show extracted model and serial number
- FR-03.6: **Step 5 — Review**: Display all captured data for review. Allow inline editing of any field. Show AI sparkle indicators on AI-populated fields. Provide "Save" and "Save & New" buttons
- FR-03.7: On save, insert a row into the `captures` table
- FR-03.8: Optionally trigger sync to Microsoft Excel

### Inventory (FR-04)

- FR-04.1: Display all captures for the authenticated user in a table
- FR-04.2: Table columns: Date, Category, Type, Label, Make, Model, Serial No, Synced
- FR-04.3: Support client-side text search across all visible columns
- FR-04.4: Support column header click to sort (ascending/descending toggle)
- FR-04.5: Support inline editing on double-click (update on blur/Enter)
- FR-04.6: AI-populated cells display a green sparkle badge
- FR-04.7: Show sync status per row (synced/not synced)

### AI Extraction (FR-05)

- FR-05.1: Accept a photo of an asset tag
- FR-05.2: Send to Google Gemini 1.5 Flash via Edge Function
- FR-05.3: Extract model number and serial number
- FR-05.4: Return structured JSON: `{ model: string, serial_no: string }`
- FR-05.5: Handle extraction failures gracefully (allow manual entry)

### Excel Sync (FR-06)

- FR-06.1: Allow users to connect a Microsoft account via OAuth2
- FR-06.2: Store the refresh token securely (in `profiles` table, server-side)
- FR-06.3: On demand, push a capture row to the user's linked Excel workbook
- FR-06.4: Track sync status per capture row
- FR-06.5: Provide offline fallback: export inventory as `.xlsx` file via SheetJS

### Notifications (FR-07)

- FR-07.1: Display toast notifications for success, error, warning, and info states
- FR-07.2: Toasts auto-dismiss after 4 seconds
- FR-07.3: Toasts stack vertically if multiple are shown

## Non-Functional Requirements

### Performance (NFR-01)

- NFR-01.1: Initial page load under 2 seconds on 3G connection
- NFR-01.2: No external network requests (zero CDN dependencies)
- NFR-01.3: Total vendored JS under 500KB uncompressed

### Security (NFR-02)

- NFR-02.1: All API keys (Gemini, Microsoft) stored as Edge Function secrets
- NFR-02.2: Client code contains only the Supabase anon key (public by design)
- NFR-02.3: Row-Level Security on all database tables
- NFR-02.4: Storage bucket policies restrict access to user's own files
- NFR-02.5: No inline `eval()` or dynamic script injection

### Accessibility (NFR-03)

- NFR-03.1: All interactive elements are keyboard-navigable
- NFR-03.2: Form inputs have associated `<label>` elements
- NFR-03.3: Color contrast meets WCAG AA for text on dark backgrounds
- NFR-03.4: Camera viewfinder has an accessible alternative (file input)

### Compatibility (NFR-04)

- NFR-04.1: Works on Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- NFR-04.2: Responsive design from 320px to 1920px viewport width
- NFR-04.3: Camera capture requires HTTPS in production

## Data Model

See the Database Schema section in the architecture plan for full table definitions.

### Key Entities

- **Profile**: Linked to Supabase Auth user. Stores Microsoft OAuth tokens and preferences.
- **Capture**: A single equipment record. Contains category, device details, AI-extracted data, photo reference, disposition fields, and sync status.

## Device Categories

| Category Key | Display Name | Status |
|---|---|---|
| `laptops_desktops` | Laptops / Desktops | Active |
| `servers` | Servers | Coming Soon |
| `drives` | Drives | Coming Soon |
| `network` | Network Equipment | Coming Soon |

## Device Types (for Laptops/Desktops category)

- Desktop
- Laptop

## Common Makes

- Dell
- HP
- Lenovo
- Apple
- Acer
- ASUS
- Microsoft
- Other

## Success Metrics

- Reduce per-device capture time from 60s to 15s
- Achieve >90% AI extraction accuracy on clear tags
- Zero data loss (all captures persisted to Supabase)
- 100% of captures syncable to Excel (manual or automatic)