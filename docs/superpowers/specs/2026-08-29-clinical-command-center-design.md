# SOS Endo Clinical Command Center — Design Specification

## Objective

Transformar o SOS Endo em um consumer app clínico premium, responsivo e acessível, com decisões assistivas, estados recuperáveis e identidade própria. O produto permanece apoio à decisão por profissional habilitado; a interface não apresenta hipóteses como diagnóstico definitivo nem modelos de prescrição como substitutos de revisão clínica.

## Approved direction

Território: **Clinical Command Center**.

- Core idea: uma central calma de decisão, execução e referência clínica.
- User job: identificar a próxima ação segura com baixa carga cognitiva durante uma urgência.
- Business job: aumentar consistência operacional sem criar falsa certeza ou automação clínica autônoma.
- Attributes: preciso, calmo, clínico, rastreável, premium e humano-supervisionado.
- Anti-references: card soup, glow/neon, dente genérico, estética de chatbot, certeza absoluta, desktop espremido e controles inertes.

## Information architecture

Primary navigation:

1. Painel
2. Triagem
3. Protocolos
4. Prescrições
5. Comunicação
6. Referências

Secondary surfaces stay inside Referências: decisão clínica, operação, checklists and FAQ. O Manifesto passa a ser conteúdo de método dentro do painel/referências e deixa de competir com tarefas clínicas na navegação principal.

## Shell and responsive contract

- Mobile below 768px: top app bar plus four-item bottom navigation; secondary pages in an accessible drawer.
- Tablet 768–1099px: compact 88px navigation rail and two-column content where useful.
- Desktop 1100px and above: 264px sidebar and bounded content container.
- Every flex child that can shrink uses `min-width: 0`.
- No document-level horizontal overflow at 320, 390, 768, 1024 and 1440 CSS pixels.
- Mobile primary actions remain visible above safe areas; long clinical context uses progressive disclosure.

## Visual system

- Midnight: `#071426`.
- Ink: `#10233F`.
- Mineral emerald: `#08A97A`.
- Clinical ivory: `#F7F5EF`.
- Mist: `#EEF3F5`.
- Warning amber: `#B96800`.
- Danger: `#C83E55`.
- Information: `#1C6E9E`.
- Two typefaces maximum: Plus Jakarta Sans for interface and Libre Baskerville only for editorial/contextual passages.
- Radius system: 10, 16 and 24px; no arbitrary rounding.
- Shadows are rare and tied to elevation. Borders and tonal surfaces provide most hierarchy.
- All interactive controls expose hover, active, focus-visible, disabled and error states.

## Product behavior

### Navigation and deep links

The current view, selected protocol, reference tab and selected FAQ are represented in the URL hash. Browser back/forward restores the prior view. Unknown state recovers to the dashboard with an explanatory message.

### Safe persisted state

- Stored checklist payload is schema validated and corruption-safe.
- Clinical checks are grouped by an explicit local session ID.
- New session and clear-session actions require confirmation.
- Old global checklist keys are migrated to a safe empty session instead of being trusted.

### Assisted triage

- “Diagnóstico” becomes “Triagem clínica assistida”.
- Result copy uses “Hipótese clínica sugerida”.
- The summary lists the answer path and requires professional review.
- Red flags and hospital referral guidance remain visually dominant.
- Mobile answer actions use a sticky action bar.

### Protocol execution

- Informational paragraphs are not checkable.
- Only checklist steps expose real checkbox inputs.
- Progress reflects checklist completion, not page scroll.
- Timer duration is structured; ranges allow the professional to choose a value.
- Timer controls have names, persistence and completion feedback.

### Prescriptions

- Copy changes from “blindada” to “modelo de apoio”.
- Each card requires a review acknowledgement before copy.
- Clipboard success is shown only after the write resolves.
- Clipboard failure offers an actionable fallback.
- Warnings are included in copied content.

### Search

- Global search covers protocols, prescriptions, scripts and FAQ.
- Search results navigate to exact destination state.
- Dialog has `role=dialog`, focus management, Escape handling and focus return.

### References and calculator

- Tabs follow WAI-ARIA semantics.
- Tables remain keyboard-scrollable and receive a mobile card representation.
- Every calculator input has a persistent label and validation.
- Hidden provisional cost is exposed.
- Zero/negative/invalid values never display NaN or Infinity.
- Results are labelled estimates.

## Accessibility contract

- WCAG 2.2 AA is the implementation baseline, not a conformance claim.
- Zoom is enabled.
- Every control has a discernible accessible name.
- Focus is visible and not obscured.
- Dialogs and drawers trap focus and restore it on close.
- Reduced motion removes nonessential transitions and ping effects.
- Color is never the only state channel.
- Toasts use live regions.
- Tables include captions and scoped headers.

## Brand assets

- Favicon: AI-generated canal/shield master, transparent PNG, adapted into 32, 180 and 512px project assets.
- Open Graph: AI-generated 1.91:1 editorial composition with exact brand copy.
- No third-party marks, people or source images.
- Prompts, source files, dimensions, hashes and selection decisions are recorded in project documentation.

## Acceptance

- Test suite covers parsing, safe persistence, route serialization, timer duration, calculator validation and clipboard result handling.
- `npm test`, `npm run typecheck` and `npm run build` pass.
- Chromium screenshots cover 320, 390, 768, 1024 and 1440px in light and dark modes.
- No material console errors, broken requests or document horizontal overflow.
- Automated accessibility has no critical violations; serious findings require explicit residual-risk reporting.
- Core workflows exercised: search-to-FAQ, triage-to-summary, protocol checklist/timer, prescription review/copy and calculator invalid input.

## External boundaries

No deploy, provider mutation, analytics activation, medical-content approval or production claim is authorized. Localhost validation is bounded local browser evidence.
