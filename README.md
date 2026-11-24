# Severity Badge with Playwright Screenshot

Create a simple UI component demonstrating Elastio Severity Pill badges using @elastio/pursuit-ui token styling. Write a Playwright visual test with offline mocking that renders the badges and captures a screenshot to qa/screenshots/severity-badge.png.

## Run
`npm i && npx playwright install chromium && npm test`

Offline: the test mocks `@elastio/pursuit-ui/tokens.css` with `tests/fixtures/tokens.fixture.css`. Real SDK token names (`--sev-*`) are unverified; align the fixture if they differ.

## API (`src/severity-badge.js`)
- `SEVERITIES`: `['critical','high','medium','low','info']`.
- `severityTone(wire)`: trims and lowercases `wire`; returns a known tone, or `'unknown'` for unknown or non-string input.
- `renderSeverityBadge(wire, { size = 'md', dot = true })`: returns a `<span class="pill" role="status">` with `data-tone` and `data-size`. Unknown tones show the text "Unknown". Load `src/severity-badge.css` for styling.
