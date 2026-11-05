# Stackboard

- This checkout builds a standalone new-tab page, not the extension described in the upstream README. `vite.config.ts` builds `newtab.html`; `public/standalone.js` provides local bookmark and settings storage.
- Preserve existing browser localStorage data when changing bookmark or settings behavior. Test with disposable browser data.
- The user service serves `dist/` on port 8765. Build before verifying served UI changes; preserve the running service and its data.
- For build and unit-test commands, see `package.json` and the README's Tests section. Extension end-to-end instructions target the upstream extension and may not apply to this standalone build.

## Agent skills

### Issue tracker

GitHub Issues: `butcherabsol/stackboard`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
