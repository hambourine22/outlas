# Map Menu — Architecture (HUX Phases 1 + 2)

> Phase 1 (Empathize / Define / Ideate) + Phase 2 (Wireframes / IA)
> Author: HUX methodology run on the Oütlas main map page
> Date: 2026-10-31
> Status: Approved to implement

---

## Verifier — three questions I'd normally ask first

The HUX methodology asks me to clarify before deciding. I've answered each with my best-guess assumption so the deliverable is not blocked; flag any you'd answer differently and the spec adjusts in minutes.

1. **Who is the primary user of the main map page right now?**
   My guess: a curious seeker in Scotland (or planning a Scotland trip) who wants to understand *what's on the ground* before they commit — a mix of outdoor-sports enthusiast and sustainable-travel researcher. Not a trade/B2B user; not a logged-in power user. See `persona.seeker` below.

2. **Are Transport / Features filters, or layers, or both?**
   My guess: **both, but surfaced as layers first**. A ski resort is a *provider* (point); a train line is a *route* (line); a hiking trail is a *geometry* (line/polygon). The menu must treat them as different *things* so the mental model scales.

3. **What's the quarter's content pipeline for Transport and Features?**
   My guess: Features (ski/hike/bike) land first (90 days) because they share pin-geometry with Providers; Transport (EV/Train/Sail) follows (180 days) because it needs line geometry and timetable data. Menu must handle "no data yet" as a first-class state.

## Refinement — two sharper versions of the goal

The user asked: *"Architect the optimum menu for the Oütlas main map page."* Two sharper framings:

- **A.** Architect the Oütlas map's *information scaffolding* so that the pin key, filter controls, feature layers and future route planner share one coherent menu — not three separate overlays. **(Recommended — picked for this deliverable.)**
- **B.** Architect a map menu system that teaches users what Oütlas *is* through its structure (the menu is the brand's taxonomy made legible), so navigating the map doubles as onboarding.

Framing A gives us the implementable spec. Framing B is captured as a brand-voice overlay on top of A — all labels and empty states are written in the voice of a quiet guide, not a form (see Phase 2 §4).

---

# Phase 1 — Strategy

## Actor
Lead UX Strategist + Behavioural Psychology.

## Step 1 — Steer to Experts

```
Expert: Don Norman
Framework: Emotional Design — three levels of processing (visceral, behavioural, reflective).
Traditional approach: Map UIs are built for the behavioural level (icons, toggles, legends) and ignore
visceral (how the map feels at first glance) and reflective (what the user tells themselves afterwards —
"I used Oütlas and it respected my attention").
Gap identified: Oütlas has a visceral asset most map tools don't — the Ü medallion, the hairline rules,
the pine/glacier/rust/sand palette. The menu should wear the brand on its sleeve from the first paint,
not become a utilitarian "map tool chrome" that could belong to any product.
```

```
Expert: Alan Cooper
Framework: Goal-Directed Design — personas and goals vs. tasks.
Traditional approach: Build filter menus around data columns ("filter by region, by score, by altitude")
because that mirrors the database.
Gap identified: Our seeker doesn't have "filter by altitude" as a goal. Their goal is "find a weekend
that works for me." The menu must organise around user *intent* (what are you looking for?) and only
expose data filters when the intent requires them.
```

```
Expert: Indi Young
Framework: Mental Model Diagrams.
Traditional approach: Legend sits on the map as a separate panel ("here's what the dots mean"), filter
controls sit in another panel ("here's what you can turn off"), route planning sits in a third.
Gap identified: These three artefacts answer the SAME question in the user's mind — "what can I see
and shape here?" — so collapsing them into one surface reduces cognitive load. The sidebar can be the
single answer to "what is on this map and how do I steer it?"
```

```
Expert: Nir Eyal
Framework: Hook Model — trigger → action → variable reward → investment.
Traditional approach: Treat a filter menu as a utility — the user does the action, nothing comes back.
Gap identified: Every toggle is an opportunity for a micro-reward. Count-updates, pin-animation on
reveal, and the ability to "save this view" (an investment deposit) turn the filter menu from a utility
into a Hook loop — the user leans in because toggling teaches them what Scotland holds.
```

```
Expert: Friedrich Fröbel
Framework: Structured Play — learning through action, not rules.
Traditional approach: Explain the taxonomy ("here are the pin colours and what they mean") as copy.
Gap identified: The sidebar should let the user *discover* the taxonomy by playing with it. Toggle a
category off and the pins vanish — the colour meaning is taught by cause and effect, not by legend copy.
This is the philosophical foundation Oütlas sits on, so the menu should embody it.
```

## Step 2 — Originality (three angles)

### Angle 1 — The Stack (Recommended)
A single sidebar organised as a stack of *layers* in brand-logical order: **Providers → Features → Transport → Regions → Saved views.** Each layer is a collapsible group containing filter rows that double as the legend (every row shows what colour / symbol / count it represents on the map). The pin key is not a separate artefact — it IS the filter menu.
*Why unconventional:* most map tools maintain a visible legend AND a filter panel; collapsing them removes a surface and matches our brand's hairline economy.
*Impact-to-effort:* **High** — reuses the components already shipped, adds structure.

### Angle 2 — The Journey Menu
Instead of filters, lead with pre-built *scenarios* — "A ski weekend," "A sustainable commute," "A beginner's day on snow." Each scenario is a saved filter state + a camera position + a short editorial note that places the user on the map.
*Why unconventional:* most map UIs treat filtering as a user chore; this treats it as an editorial choice the brand has already made for the user.
*Impact-to-effort:* **Medium** — needs editorial content for each scenario; worth building once the data layers mature.

### Angle 3 — Prompt-the-Map **(Risky)**
Replace the structured menu with a single input field: "Show me…". The sidebar is a prompt, not a form. "ski resorts under 800m" → the map filters itself. "quiet coast with gear rental" → likewise.
*Why unconventional:* no mainstream map tool treats the sidebar as a natural-language prompt.
*Impact-to-effort:* **Low → transformative-if-it-works** — needs LLM infra, intent-mapping to the taxonomy, and graceful fallback. Could be the "wow" moment, could leave the user stranded with no affordances.

**Recommendation: Angle 1 (The Stack).** Ships now with the current primitives, carries the brand's hairline sensibility, scales the way the data pipeline is scheduled to scale, and leaves Angle 2 as an editorial layer that can sit on top of it in Q2.

## Step 3 — Chain of Thought

```
Observation: The reference image Hamish shared shows MAP SYMBOLS → TRANSPORT + FEATURES as
cohabiting groups, implying the taxonomy already lives in his head. The current build only
exposes Providers. The brand's four pin colours are already deployed on the map.
Surface interpretation: "Add more groups to the sidebar."
Deeper question: Why are TRANSPORT and FEATURES even on this menu? Are they filters, or
are they different kinds of thing (routes vs. points) and does lumping them together confuse
their nature?
Root cause hypothesis: The map menu currently answers one question ("which providers are
visible?") but the user has three: (1) what kinds of thing can I see? (2) where can I see
them? (3) can I save this view and come back? The sidebar must answer all three in a single
coherent gesture or the brand reads as "another map UI."
Evidence for: Hamish's own reference image groups Transport + Features alongside Providers
under MAP SYMBOLS — implying a mental model where all three are peers under "symbols on the
map," even though technically Transport is routes.
Evidence against: Transport-as-routes may need its own render pipeline (lines, not circles),
which is a different interaction. Users of the TwelveLabs reference docs sidebar used
category grouping successfully — our users may do the same without differentiation.
Confidence: Medium-High for the stack model; Medium for the Transport-as-routes caveat
(hedged by phasing Transport last).
```

## Step 4 — Problem Statement

> **A Scotland-curious outdoor-sport seeker** needs **a single, honest view of what's on the ground and how to steer it** because **the terrain itself is layered (providers, activities, access routes, regions) and no existing map tool organises those layers around user intent**, but currently **the map menu answers only "which providers are visible?" and treats every other question as a different surface or feature request**. The opportunity is **a stacked, layer-first menu that doubles as the pin key and the filter controls, is honest about which layers have data yet, and scales to Regions and Saved Views as data arrives**, which would result in **a map that teaches the Oütlas taxonomy by use (Fröbel), rewards exploration (Eyal), and reads as unmistakably Oütlas from the first paint (Norman)**.

## Step 5 — Verification Protocol

### Assumption Register

| # | Assumption | Confidence | Invalidator |
|---|---|---|---|
| 1 | Users want provider + activity + transport in one sidebar, not separate overlays | **High** | A/B test shows separate overlays score higher on time-to-first-pin |
| 2 | A filter row IS a legend row — the user doesn't need both | **High** | Comprehension test shows users can't name pin colours after using the menu |
| 3 | Showing empty groups ("Transport — coming") builds brand trust rather than looking unfinished | **Medium** | Usability feedback flags "coming soon" as a trust-breaker |
| 4 | A seeker will come back and want to save a view | **Medium** | Analytics show <5% of sessions revisit; investment loop isn't worth building |
| 5 | Regions should be filter-by-region (not navigate-to-region) | **Medium** | Users expect clicking a region to pan + zoom the map, not filter the pin set |

### Counter-evidence for the primary conclusion
The strongest counter is: Google Maps, Komoot and OnX Hunt (closest competitors) all separate the pin legend from the filter controls. If that split were objectively worse, one of them would have unified it by now. Our bet is that Oütlas's hairline sensibility and smaller surface area tolerate the collapse where theirs can't — but if users miss the dedicated legend, we add a `?` icon next to each group header that opens a static key tooltip.

### Debug statement — "What I did and why"
I took the reference image as a mental-model artefact (not a UI spec), named the user with Cooper's lens, then applied Norman + Fröbel to argue the menu must be visceral and discoverable, not a utility. I used Eyal to argue each toggle is a reward opportunity (count + animation), and Young to collapse three artefacts into one. I rejected the risky prompt-the-map angle for now because the data layers aren't deep enough to make the input shine.

### Dependency map — what Phase 2 needs from Phase 1
- **The stack order:** Providers → Features → Transport → Regions → Saved Views
- **The dual-purpose rule:** every filter row is also a legend row
- **The "no data yet" first-class state:** empty groups are expected and must be designed, not deferred
- **The seeker persona:** copy and empty states must sound like a quiet guide, not a form

## Step 6 — Learning Capture

```yaml
phase: 1
insight: |
  The pin key and the filter menu are the same artefact. Oütlas's hairline economy
  tolerates (indeed requires) the collapse where competing map tools cannot.
assumption_validated: |
  Statement: The seeker's primary question is intent-shaped ("what can I see and
  how do I steer it?"), not data-shaped ("filter by altitude").
  Evidence: Reference image groups by *kind of thing* (Transport, Features) not
  by data column. Hamish's taxonomy itself is intent-shaped.
assumption_invalidated: |
  Statement: An editorial scenario menu (Angle 2) should ship first.
  Evidence: Scenarios need the underlying data layers to be in before they can
  compose. Angle 1 (The Stack) must ship first; scenarios compose on top.
framework_most_useful: |
  Indi Young's Mental Model Diagrams — made it clear the three apparent artefacts
  (legend, filter, planner) answer one question in the user's head.
question_remaining: |
  How much of the sidebar's cognitive load is from colour-recognition vs. label-
  recognition? Phase 3 user testing should surface this (strip the colour swatches
  from one condition and compare time-to-correct-pin).
```

---

# Phase 2 — Structure

## Actor
Information Architect + UX Designer.

## Step 1 — Narrative (Hook → Action)

| Beat | On the map |
|---|---|
| **Hook** | First paint: Scotland's shape, Loch Lomond labelled, pin colour clusters. The viewer sees terrain + brand before anything asks for input. |
| **Problem** | Too many pins at once — "which of these matter to me?" The sidebar's job is to answer that question without becoming a form. |
| **Insight** | Toggling a category off makes those pins vanish — the user *discovers* that colour = category by cause and effect, not by reading a legend. |
| **Proof** | The count on each row updates live. The map re-centres on the remaining pins. The sidebar shows "4 of 16 pins visible." |
| **Action** | Click a surviving pin → right preview panel opens with the record. Click "Save this view" → the current filter + camera state is stashed as a Saved View (future). |

Every row and group in the sidebar maps to one of these beats. Any element that doesn't earn its narrative beat gets cut before implementation.

## Step 2 — Evident: screen-by-screen flow

### Screen A — The map at first paint

- **Purpose:** show what's on the ground before asking anything.
- **User question:** "What is this and what can it do for me?"
- **Answer:** Scotland + pins + a left rail with the taxonomy, all legible without clicks.
- **Exit:** either (a) interact with the sidebar (filter) or (b) click a pin (preview).
- **Components (primary → tertiary):**
  - Primary: map canvas with pins; left MapMenuSidebar in default-open state; TopBar with brand mark.
  - Secondary: Reset view button; Saved views affordance (future).
  - Tertiary: Mapbox attribution; mode switcher.

### Screen B — The sidebar (default state, open)

- **Purpose:** be the single home for *what can I see* + *how do I steer it*.
- **User question:** "What are my options?"
- **Answer:** a stack of layer groups, each a collapsible section with colour-coded rows that are both legend and toggle.
- **Exit:** any row toggles its category; any group header collapses/expands; chevron collapses to rail.
- **Components:**
  - Primary: Group header + chevron; toggle rows with colour dot + label + count + palette note; "Show/hide all" row.
  - Secondary: "View summary" footer ("5 of 16 pins visible") — see Step 4; "What am I looking at?" `?` icon per group.
  - Tertiary: Keyboard shortcut hints (`/` to open, `Esc` to close).

### Screen C — The right preview (pin clicked)

- **Purpose:** show one record in brand voice without taking the user off the map.
- **User question:** "What's this specific thing?"
- **Answer:** hero image + display-2 title + category badge + body + shape-aware Details list.
- **Exit:** Close X (back to map); "Learn more" (deeper page); pin another (replaces content).
- **Components:** already shipped — see `app/ui/mapbox/MapPreviewSidebar.tsx`.

### Screen D — The sidebar (collapsed rail)

- **Purpose:** give the map maximum breathing room without hiding the handle.
- **User question:** "Where did my controls go?"
- **Answer:** a 40px rail with the chevron and a vertical stack of coloured dots that still read as a legend at a glance.
- **Exit:** chevron expands back to the full stack.
- **Components:** chevron button; four colour pips (one per category).

### Screen E — The sidebar on mobile (≤768px)

- **Purpose:** keep the same mental model on a narrow screen.
- **User question:** "How do I filter here?"
- **Answer:** a bottom-sheet pulled from a floating "Map symbols" chip anchored bottom-left; drags up to full height; tap outside to dismiss.
- **Exit:** swipe down, tap outside, or tap an item.
- **Components:** floating chip; bottom-sheet with the same group stack; grab handle; backdrop.

## Step 3 — Text wireframe (primary screen — desktop, sidebar open)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  ☰  OÜTLAS                                       GITHUB → LIVE SITE → ☀◉☾  │  TopBar — brand + utility
├─────────────┬─────────────────────────────────────────────────────────────────┤
│             │                                                                 │
│  MAP SYMBOLS│                                                                 │
│ [ chevron < ]                                                                 │
│             │                                                                 │
│  PROVIDERS ▾│                                                                 │
│  ●  Resorts │                                                                 │
│         5 · PINE                                                              │
│  ●  Rentals │                       MAP CANVAS                                │
│         4 · GLACIER                                                           │
│  ●  Repairs │                                                                 │
│         3 · RUST                                                              │
│  ●  Guides  │                                                                 │
│         4 · SAND                                                              │
│             │                                                                 │
│  FEATURES ▸ │          (collapsed — "Coming in winter 25/26")                 │
│             │                                                                 │
│  TRANSPORT ▸│          (collapsed — "Coming in spring 26")                    │
│             │                                                                 │
│  REGIONS ▸  │          (collapsed — "All of Scotland shown by default")       │
│             │                                                                 │
│  ────────── │                                                                 │
│  Hide all   │                                                                 │
│  Save view  │                                                                 │
│             │                                                                 │
│             │                                                   RESET VIEW ⟲ │
│             │   mapbox   © Mapbox © OpenStreetMap   Improve this map          │
└─────────────┴─────────────────────────────────────────────────────────────────┘
    ↑ 288–320px        ↑ 100% of remaining width
```

Hierarchy notes:
- The group header (`MAP SYMBOLS`) is label-caps and acts as the sidebar's own name — not the parent of all groups. **PROVIDERS**, **FEATURES**, **TRANSPORT**, **REGIONS** are the real layer groups, each independently collapsible.
- Only PROVIDERS is open by default (it's the one with live data).
- The footer stacks utility rows: *Hide all / Show all*, *Save view* (future), *Reset filters*. The brand's hairline rule marks the footer boundary.

## Step 4 — State mapping (every screen × every state)

### Screen B — the sidebar

| State | Treatment |
|---|---|
| **Default** | PROVIDERS open with 4 toggles active; FEATURES / TRANSPORT / REGIONS collapsed, each with a one-line "coming" chip beside its chevron. |
| **Empty** | A group has zero data in it (e.g. no guides in a region): row renders greyed, count=0, no toggle. Group label stays visible so the taxonomy is intact. |
| **Loading** | Count badges render as a hairline shimmer (3-dot animation at `--ink-faint`). Rows remain clickable; map still shows pins as they arrive. |
| **Error** | A load error on a group shows an inline hairline note under the header: "Couldn't load Rentals · Retry". No red; stays in brand voice. |
| **Success** | Toggle registers: dot stays saturated, count stays live, row background flashes `--row-active` for 150ms then settles. Pins fade in/out at 180ms. |
| **Edge — all off** | "View summary" at the footer reads: *"Nothing to show. Flip at least one layer back on."* with a quiet link to *Show all*. |

### Screen D — collapsed rail

| State | Treatment |
|---|---|
| **Default** | 40px rail, chevron bottom, four colour pips stacked vertically — pips are tiny but readable, so the key is still visible in collapsed form. |
| **Empty** | A category with zero pins shows a hollow pip (border only), not filled. |
| **Loading** | Pips pulse at `--ink-faint` opacity. |
| **Error** | Chevron turns to a `!` glyph; tap expands and shows the inline error. |
| **Success** | Pip saturates on filter-active, dims on filter-off. |
| **Edge — all off** | Rail renders four hollow pips; chevron is the only affordance. |

### Screen E — mobile bottom sheet

| State | Treatment |
|---|---|
| **Default** | Chip anchored bottom-left: "⚑ 16 pins" (icon = Ü medallion); tap expands sheet. |
| **Empty** | Chip reads "0 pins"; sheet opens with "Show all" prominent. |
| **Loading** | Chip reads "loading…"; sheet opens to skeleton rows. |
| **Error** | Chip reads "retry"; sheet opens with the inline note. |
| **Success** | Chip updates count live as filters toggle. |
| **Edge — orientation flip** | Sheet re-anchors to the new short edge; preserves filter state. |

## Step 5 — Assumption register (Phase 2)

| # | Assumption | Confidence | Invalidator | Impact if wrong |
|---|---|---|---|---|
| 6 | Users will expand FEATURES/TRANSPORT groups to peek at what's coming | Medium | 0% expand rate in analytics | Low — just stays collapsed; design still readable |
| 7 | A dot-pip rail (collapsed state) still communicates the legend | Medium | Users can't identify a category by pip in testing | Medium — collapsed mode becomes less useful; expand remains the primary mode |
| 8 | Count updates are the primary micro-reward (Eyal) | Low-Medium | Eye-tracking shows users don't look at counts | Low — animation on pins carries most of the reward |
| 9 | REGIONS should be a filter, not a navigation group | Medium | Users expect "Highlands" to pan the camera, not filter pins | High — would require a different interaction model for that group |
| 10 | Saved Views is worth building in v2 | Medium-High | Analytics show <5% repeat use | Medium — v2 feature only, not blocking |

Cross-reference against Phase 1 assumptions:
- Assumption 1 (unified sidebar) is reinforced by Assumption 6 (users will peek).
- Assumption 3 ("coming" labels build trust) is directly dependent on Assumption 6 — if users don't peek, the trust bet doesn't pay out. Both resolved by the same Phase 3 test.
- Assumption 5 (Regions is a filter) echoes forward as Assumption 9. Both ride on the same test.

## Step 6 — Dependency map

**Received from Phase 1:**
- Problem statement (Scotland-curious seeker needs unified view-and-steer)
- Recommended strategic direction (Angle 1 — The Stack)
- Stack order (Providers → Features → Transport → Regions → Saved Views)
- Dual-purpose rule (filter row == legend row)
- Seeker persona + voice (quiet guide, not a form)

**Sending to Phase 3 — Research & Testing:**
- The five screens (A–E) and their text wireframes
- The 10-row assumption register (with the five Phase-1 ones)
- The six-state matrix per screen
- Three testable hypotheses:
  - H1 — collapsing the legend into the filter rows preserves comprehension at ≥95% of a separate legend's score (Assumption 2)
  - H2 — showing empty groups with "coming" labels does not materially reduce trust (Assumption 3)
  - H3 — Regions behaves correctly as a filter (not a camera) for ≥70% of users (Assumption 9)

**Sending to Phase 4 — Visual Design:**
- Component inventory (group header, toggle row with colour swatch, chevron, pip rail, bottom-sheet grab-handle, "View summary" footer)
- Motion spec (toggle: 150ms background flash on `--row-active`; pin fade: 180ms; chevron rotate: 150ms ease-out)
- Accessibility notes: all toggles ARIA-pressed, group headers ARIA-expanded, keyboard: `/` focus the sidebar, `Esc` dismiss, `Tab` traverses rows, `Space`/`Enter` toggles.

## Step 7 — Learning capture

```yaml
phase: 2
structural_decisions_that_felt_uncertain:
  - Whether REGIONS belongs here or in the TopBar (resolved: here, so the user has one place to steer).
  - Whether "Saved views" is a stacked group or a footer action (resolved: footer action, to avoid
    an empty group when the feature isn't live).
assumptions_validated_from_phase_1:
  - The seeker's question is intent-shaped: confirmed by the group labels we chose (Providers,
    Features, Transport, Regions — all answers to "what can I see?").
assumptions_invalidated_from_phase_1:
  - None invalidated yet — Phase 3 testing required.
patterns_borrowed:
  - TwelveLabs docs sidebar: collapsible group headers with chevron, auto-expand on relevance.
  - Komoot: stacked activity filters (we borrow the stack, reject the per-activity drawer).
  - Google Maps "Explore" bottom sheet (mobile pattern).
  - Oütlas Story pages: hairline rules, label-caps, display-2 for titles — same vocabulary flows
    into Preview panel and sidebar footer.
questions_for_phase_3:
  - Do users expand the empty groups? If no — the "coming" label doesn't pay out and we should
    hide those groups until data lands.
  - Is REGIONS semantically a filter or a camera? If camera — split it out of the sidebar entirely.
  - Does the collapsed-rail pip legend scan at a glance?
```

---

# Implementation spec — direct for the engineer

> This section is what the code change needs. Everything above is the reasoning behind it.

## 1. The sidebar stack order (shipping now)

```
MAP SYMBOLS            (sidebar name, label-caps, header-only)
├── PROVIDERS   ▾      (open by default, live data)
│   ●  Resorts     5 · pine
│   ●  Rentals     4 · glacier
│   ●  Repairs     3 · rust
│   ●  Guides      4 · sand
├── FEATURES    ▸      (collapsed, "Coming in winter 25/26" chip)
├── TRANSPORT   ▸      (collapsed, "Coming in spring 26" chip)
└── REGIONS     ▸      (collapsed, "All of Scotland shown by default" chip)
──────────────────────
    5 of 16 pins visible          (View summary — live count)
    Hide all                       (quick toggle)
    Save this view                 (future — v2)
```

## 2. The "coming" chip pattern (new primitive)

A collapsed group header that has no data yet gets an inline chip rendered beside its chevron. The chip is `font-mono` 10px uppercase, `text-ink-faint`, with a single-letter prefix (`✦` for pre-release). It never pretends to be clickable.

```tsx
<GroupHeader>
  <Label>Features</Label>
  <Hint>✦ Winter 25/26</Hint>
  <Chevron />
</GroupHeader>
```

If the user expands an empty group they see one line, label-caps, in `--ink-faint`:
> *"Ski, hike, bike trails and more — stitched in as data lands."*

That's it. No fake toggles.

## 3. The View summary footer

A row that lives between the stack and the utility actions. It reads **"n of N pins visible"** where N is the sum across all live categories and n is the sum after filters. It's `font-ui text-xs text-ink-muted`. When n=0 it switches to the brand-voice edge-case copy: *"Nothing to show. Flip at least one layer back on."* with a `Show all` link.

## 4. Mobile pattern (viewport ≤ md)

The sidebar aside becomes a bottom-sheet pulled from a floating chip. The chip is anchored bottom-left (so it doesn't clash with Reset view bottom-right). The chip's text is the live view-summary count. Tap: sheet rises to 60dvh with a drag handle at top; drag or tap outside to dismiss.

## 5. The pin key rule (consolidation)

> **The pin key is NOT a separate overlay anywhere on the map.** Every colour the map uses must be labelled on an active row in the sidebar. The legacy `MapLegend` component is retired.

If the sidebar is collapsed to the rail, the four pips in the rail are the key. If the sidebar is open, the four toggle rows are the key.

## 6. Keyboard

| Key | Action |
|---|---|
| `/` | Focus the sidebar (open it if collapsed) |
| `Esc` | Collapse the sidebar; or close the preview if it's open |
| `Tab` | Traverse group headers, then rows |
| `Space` / `Enter` | Toggle focused row or header |
| `g p` / `g f` / `g t` / `g r` | Jump to Providers / Features / Transport / Regions |

## 7. Component contract

```ts
type MapCategory = "resorts" | "rentals" | "repairs" | "guides";
type FeatureLayer = "ski" | "hike" | "bike" | "fishing" | "kayak" | "birding" | "climbing" | "wild_swimming" | "camping";
type TransportLayer = "ev" | "train" | "sail";
type Region = "highlands" | "cairngorms" | "trossachs" | "borders" | "islands";

type MenuGroup<K extends string> = {
  key: K;
  label: string;
  rows: Array<MenuRow<K>>;
  hint?: string;            // e.g. "✦ Winter 25/26" when empty
  defaultOpen?: boolean;    // only PROVIDERS true in v1
};

type MenuRow<K extends string> = {
  key: string;
  group: K;
  label: string;
  swatch: string;           // CATEGORY_COLOUR or category-local palette
  note: string;             // "pine" | "glacier" | …
  count: number;            // 0 when the layer has no data yet
  active: boolean;          // filter state
};
```

The existing `MapFilters: Record<MapCategory, boolean>` becomes `MapFilters: Record<string, boolean>` keyed by `row.key`. Each group gets its own `onToggle(row.key)` dispatcher. The map's GeoJSON `setData` learns to filter by `properties.dataType ∈ activeKeys`.

## 8. Phased delivery

| Phase | Scope | Blocker |
|---|---|---|
| **v1 (now)** | PROVIDERS group as today, plus FEATURES/TRANSPORT/REGIONS as collapsed-empty groups with "coming" chips, plus the View summary footer, plus retiring MapLegend. | None — current primitives suffice. |
| **v1.1 (in 2 weeks)** | Mobile bottom-sheet; keyboard shortcuts. | Needs touch gesture lib (Framer Motion or stock pointer events). |
| **v2 (Q1 26)** | Features layers hydrated with real data; FEATURES group becomes live. | Content layer in `app/content/map/features/`. |
| **v2.1 (Q2 26)** | Transport layers (lines/routes) — needs new render path, not circle layer. | Mapbox line layer; schedule/route data model. |
| **v3 (Q2 26)** | Saved Views + editorial scenarios (Angle 2 overlaid on Angle 1). | Needs user accounts or anonymous persistence. |

---

> **Debug statement — Phase 2:** I kept the sidebar as the *single* surface for every map-steering question the user has. I collapsed the legend into the filter rows. I treated the four live categories as the only data group and the future three groups (Features, Transport, Regions) as first-class "coming" states so the stack reads as planned, not as unfinished. I kept the brand voice through every empty state so the sidebar sounds like Oütlas even when it's quiet.
