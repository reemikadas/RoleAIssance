# RoleAIssance

Reimagine your job search with AI.

RoleAIssance is an AI-assisted job-search workspace for discovering relevant roles, preparing evidence-backed application materials, tracking applications, organizing documents, and preparing for interviews.

## Current MVP

- Responsive dashboard and navigation
- Explainable job matching with tested scoring rules
- Job discovery and filtering
- Application pipeline
- Organized document library
- Interview preparation workspace
- Verified candidate profile
- Secure local master-resume upload, replacement, download, and deletion
- Local PDF/DOCX text extraction with an explicit profile-suggestion review step
- Consent-oriented integration controls
- Job detail and application-package workflow

The current release includes a frontend MVP plus a local Express API and SQLite-backed editable candidate profile. External AI, authentication, email, calendar, GitHub, cloud storage, and job-feed integrations are represented in the product flow but are not yet connected to production services.

## Run locally

```bash
npm install
npm run dev
```

This starts both services:

- Web app: `http://localhost:5173`
- Local API: `http://127.0.0.1:8787`

Profile changes are saved in `.data/roleaissance.db`.
Master resume files are saved with private filesystem permissions under `.data/uploads`.

## Verify

```bash
npm test
npm run build
```
