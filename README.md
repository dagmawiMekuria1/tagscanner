# TagScanner

**Camera → Spreadsheet in 15 seconds.**

TagScanner is a web application for IT asset disposition (ITAD) teams to quickly capture equipment tags (model numbers, serial numbers) using a phone camera, extract data via AI, and sync results directly to a Microsoft Excel spreadsheet.

## What It Does

1. **Capture** — Point your camera at a device's asset tag
2. **Extract** — AI (Google Gemini 1.5 Flash) reads the model and serial number
3. **Review** — Verify and correct extracted data
4. **Sync** — Push the record to your Microsoft Excel workbook automatically

## Architecture

- **Frontend**: Static HTML, CSS, and vanilla JavaScript (ES modules). No build step.
- **Backend**: Supabase (Auth, Postgres DB, Storage, Edge Functions)
- **AI**: Google Gemini 1.5 Flash via Supabase Edge Function
- **Spreadsheet**: Microsoft Graph API via Supabase Edge Function
- **Export Fallback**: SheetJS (vendored locally) for offline `.xlsx` export

## Project Structure
