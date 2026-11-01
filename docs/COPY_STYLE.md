# Oütlas copy style

> How we talk, everywhere on this site. Written against a specific voice — Nikolai Schirmer's gear-review voice — because the brand ethos ("Share gear. Buy less. Ride more.") and the voice ethos ("use it until it doesn't work") are the same sentence in two forms.

If you're writing a button label, an empty state, a chapter dek, a resort card, an error message, a tooltip or an email, read this file first. If a word on screen doesn't pass "would Nikolai say it like this?" in one read, rewrite it.

---

## The core shift

Most product copy sells. Oütlas copy **tells the truth and respects the reader's time.** That reframe runs through everything below.

| Instead of | Write |
|---|---|
| "Amazing new ski resorts!" | "Five resorts in the Highlands, with scores from 3 to 72." |
| "Loading..." | (nothing — a hairline shimmer; letters are noise) |
| "Oops! Something went wrong." | "Couldn't load Rentals. Retry?" |
| "Discover your perfect gear" | "Here's what works. Here's what doesn't." |
| "Join thousands of happy riders" | "A few hundred riders use this. Here's who." |

The sell-less-mean-more move isn't a quirk. It's the whole brand.

---

## Six voice principles

### 1. Honest about commerce

The reader knows we're a marketplace. Pretending otherwise insults them. **Name the business model** when it comes up, and move on.

- ✓ "We take a referral fee when you book through a listed provider. That funds this site."
- ✓ "This story is sponsored by Ortovox. We picked them because their touring kit is the best we've tested."
- ✗ "Oütlas is proud to partner with industry-leading brands to bring you..."

### 2. Specific, not generic

A number, a name, a dimension beats an adjective every time. "Fast" is nothing; "6 minutes from Aviemore station" is something.

- ✓ "The Lecht · 793 m · ~17 km of lift-served runs · nearest rail Aberdeen."
- ✗ "Discover amazing Scottish ski experiences."

### 3. Admit trade-offs

Every object, place and service has a weakness. Say what it is. The reader trusts the next sentence more because of it.

- ✓ "Soft-shell bibs breathe better than hard-shell. They also get wet if you sit in snow. Don't buy them for Pacific Northwest days."
- ✓ "This is the lightest pack we list. It's also the least durable — a snagged rock on day three will show."
- ✗ "Lightweight AND durable!"

### 4. Warn when it matters

If something isn't right for part of the audience, say so prominently. **A warning is care, not a disclaimer.**

- ✓ "Not for walk-ins. Call ahead."
- ✓ "Closes 15:30 on weekdays — plan the drive down."
- ✗ Burying hours in a footer no one reads.

### 5. First-person testing, lived experience

When we recommend, we recommend from use. If we haven't used it, we say we haven't. If a friend has, we name them.

- ✓ "Craig Burry shot this set in the Cairngorms last winter."
- ✓ "We haven't tested this one yet. Here's what the manufacturer says; we'll update when we have."
- ✗ "Experts agree this is the best in class."

### 6. Celebrate the niche

Scotland is small. Backcountry skiing in Scotland is smaller. Snow in Scotland is smaller still. **Lean into it** — the reader is here because they love this exact niche.

- ✓ "Five resorts. One good season a year, if we're lucky."
- ✓ "You already know whether you need splitboard skins. We won't explain."
- ✗ "Explore the vast possibilities of Scottish winter sports!"

---

## Patterns by surface

### Page titles · display-1 / display-2 (Vollkorn)

Names of places and things in plain English. Rarely a sentence; never a slogan.

- ✓ "Ski Touring & Risk Space"
- ✓ "The Lecht"
- ✓ "Rentals"
- ✗ "Welcome to the Oütlas rentals portal"
- ✗ "Discover the world of Scottish skiing"

If the page is editorial (a Story), use its real name. If it's a hub (a route), use the category noun.

### Deks · one line under the title (serif, muted)

A dek is one sentence that tells the reader what they'll get and whether they need it. Not a tagline.

- ✓ "An interactive guide to avalanche risk, the three essentials of ski touring, and a working checklist for assessing snow stability."
- ✓ "Mountain guides registered with Oütlas across Scotland. Human expertise in the brand's provider taxonomy — sand pins on the map."
- ✗ "Everything you need to know about staying safe in the backcountry."
- ✗ "Your journey starts here."

### Eyebrows · label-caps above the title

A category word, not a message. One or two words max.

- ✓ `REGION` / `MARKETPLACE · GUIDES` / `RISK SPACE, NO. 1`
- ✗ `WELCOME TO...` / `NOW TRENDING` / `FEATURED!`

### Buttons · imperative, one or two words

What happens when you press this. No pleading.

- ✓ "Reset view" / "Learn more" / "Show all pins" / "Save this view" / "Open in Mapbox"
- ✗ "Click here!" / "Get started today" / "Submit" / "Continue your journey"

For a destructive or irreversible action, add the object: "Delete booking" not "Delete".

### Chips · one or two words

A chip is a tag or a status, never a sentence. If you need a sentence, don't use a chip.

- ✓ "pine" / "Winter 25/26" / "✦ Spring 26" / "Published" / "Draft"
- ✗ "Click to filter by this category"

### Empty states

Say what's not there, then say what to do.

- ✓ "No guides listed yet in this region."
- ✓ "Nothing to show. Flip at least one layer back on."
- ✓ "No stories yet. The first one lands when the snow does."
- ✗ "There are currently no items available at this time. Please try again later."
- ✗ "Oops! Nothing to see here."

### Error states

Name what failed, offer the one next step. No apology for the machine's behaviour.

- ✓ "Couldn't load Rentals. Retry."
- ✓ "Mapbox token missing. Set `NEXT_PUBLIC_MAPBOX_TOKEN` in your Vercel project to light up the basemap."
- ✗ "Error 500: Internal server error occurred while processing your request."
- ✗ "We're sorry! Something went wrong on our end."

Never use the word "Oops."

### Loading states

Rarely needed. If you need one: a hairline shimmer or a single word. Not a message about the loading.

- ✓ (shimmer) · "Loading…" (one line, no emoji)
- ✗ "Please wait while we fetch your personalised results..."

### Future-state / "coming" copy

A planned feature that isn't live yet shouldn't lie about readiness. Use the chip prefix `✦` and a short honest label.

- ✓ "✦ Winter 25/26" / "✦ Soon — filter by region" / "✦ Save this view — coming"
- ✗ "Beta" / "Coming soon!" / "Experimental feature"

If a user expands a "coming" group, give one brand-voice line explaining what will land there:
- ✓ "Ski, hike, bike trails and more — stitched in as data lands."
- ✗ "This feature is currently under development. Check back later for updates."

### Credits & attribution

Name the person. If it's a placeholder for licensed work still to arrive, say so honestly.

- ✓ "Words by Zeger Dox"
- ✓ "Placeholder photography by Craig Burry — Cairngorms splitboarding set, standing in for Zeger Dox / Ortovox."
- ✗ "Image courtesy of [provider]."
- ✗ Uncredited photography (ever).

### Resort / rental / repair / guide cards

Fact-dense. The reader is comparing, not browsing.

- ✓ "The Lecht · Scotland · 793 m · nearest rail Aberdeen · Oütlas score 3/100"
- ✓ "Mhairi Macdonald · Mountain Guide · Lochaber · English, Gaelic · £320/day"
- ✗ "The Lecht offers an unforgettable Scottish mountain experience!"

Fields come through the content layer; keep the voice at the field *level* (what each cell says), not in a cover-copy wrapper around them.

### Microcopy on filters, toggles, panels

Match what's happening on screen, in words that could be said out loud by a human in a shop.

- ✓ "Hide all pins" / "Show all pins" / "16 of 16 pins visible"
- ✓ "Collapse map symbols" / "Open map filters"
- ✗ "Toggle visibility of all map markers"
- ✗ "Deactivate pin display globally"

### Legal, policy, nav footer

Still ours. Short, direct, no legalese when a human sentence works.

- ✓ "We'll never sell your email."
- ✓ "This site uses cookies for basic session state. No tracking, no ad network."
- ✗ "By continuing to use this website, you consent to our use of cookies and acknowledge our updated terms of service..."

### Email subject lines (future)

Say what's in the email in six words or fewer. No clickbait.

- ✓ "The Lecht opens Saturday."
- ✓ "Your weekend view · 3 Oct"
- ✗ "You won't BELIEVE what happened in the Cairngorms this week!"

---

## The "don't" list

Words and patterns we don't use. Not because they're wrong — because they're borrowed from a different kind of brand.

- **Oops · Oops!** — never.
- **Journey, experience, adventure** (as nouns in marketing position) — reserved for real editorial use.
- **Discover · explore · unlock** (as the first verb of a CTA) — the reader is already here.
- **Amazing · incredible · epic · revolutionary · game-changing** — all adjectives that mean "we have nothing specific to say."
- **Perfect · ideal · must-have · best-in-class** — superlatives are a tell.
- **Welcome to Oütlas** — never greet the reader; show the thing.
- **"We're excited to announce"** — the reader isn't excited yet. Lead with the thing itself.
- **Emoji in body copy** — the `✦` prefix for "coming" chips is the one sanctioned mark. (Icons from the system are not emoji.)
- **Exclamation marks** — one on the entire site, maybe, if a photo credit demands it. Default to a full stop.
- **"Click here" · "Press this button" · "Tap to continue"** — the control already says what it does.
- **Em-dash as decoration** (`— Welcome —`) — em-dashes are for parenthetical thought, not framing.
- **ALL CAPS in body copy** — reserved for `.label` / `.micro` chrome. Never a sentence.
- **"At this time", "Please note that", "In order to"** — padding.

---

## Honesty patterns worth having

Three specific patterns the Nikolai voice gives us that aren't typical of marketing copy. Use them deliberately.

### The "if-not-you" warning

Tell the audience segment this isn't for, so the rest know it is.

> "Soft-shell bibs — don't buy for Japan or the Pacific Northwest, where you'll be wet through. Right for Scotland, Jackson, dry Alpine days."

> "This resort scores 3/100. Not because it's bad — because it's small, often closed, and the lifts predate most of the people riding them. For the right skier, it's the whole point."

### The named limit

When something has a hard limit, name it with the number.

> "Three days' battery in a Rocky Talkie, give or take, depending on how much you talk."

> "The 55 L pack carries a full week of self-supported touring. Beyond that and you're overpacking."

### The honest substitute

If something we're showing is a stand-in for the real thing, say so in the credit line.

> "Placeholder photography by Craig Burry — Cairngorms splitboarding set, standing in for Zeger Dox / Ortovox. Swap-ready when the licensed assets arrive."

---

## Current Oütlas copy — audit

### On-voice already (keep as reference)

| Where | What it says | Why it works |
|---|---|---|
| Map menu footer | "Nothing to show. Flip at least one layer back on." | Edge-case copy in Nikolai register — states what's not there, says what to do, no apology. |
| Map menu Features group | "Ski, hike, bike trails and more — stitched in as data lands." | Future-state honest; the specific noun list beats "many categories coming soon". |
| Map menu region card | "✦ Soon — filter by region" | The `✦` prefix pattern + honest "soon" (no fake "beta" or "coming next week"). |
| Ski Touring story credit | "Placeholder photography by Craig Burry — Cairngorms splitboarding set, standing in for Zeger Dox / Ortovox." | The textbook honest-substitute line. |
| Guides index dek | "Mountain guides registered with Oütlas across Scotland. Human expertise in the brand's provider taxonomy — sand pins on the map." | Fact-dense, references the system, no sales. |
| Map placeholder (no token) | "The map is standing by — add your Mapbox token to light up the N pins already in the content layer." | Error-as-instruction. Says what's missing, says what to do. |

### Off-voice, worth revisiting (open XS briefs when the surface is next touched)

| Where | Current copy | Why it misses | Suggested rewrite |
|---|---|---|---|
| Site tagline | "Share gear. Buy less. Ride more." | *This is on-voice — keep it.* | — |
| Browser title | "Oütlas — Share gear. Buy less. Ride more." | Fine. | — |
| TopBar hamburger label | "Open navigation" / "Close navigation" | Generic ARIA. | OK for ARIA — not visible copy. Keep. |
| Design System chip | "v2 · Design System" | Fine. | — |
| Stories empty state | ? (none shipped yet) | — | "No stories yet. The first lands when the snow does." |
| Rentals card byline | ? (default template) | — | Name the person before the shop. "Angus Kerr runs this shop out of Aviemore. Open Thurs–Mon, 10:00–17:30." |
| Resort "Oütlas score" | A bare number | A number without a sentence to lean on reads as a review score. | Add one-line context on the Score page: "Oütlas score is sustainability + accessibility + value, out of 100. 3 isn't bad; it's small." |
| Any future "Welcome to Oütlas" | — | Would violate "never greet the reader". | Start with the thing itself. |

Burn down the right column as each surface is next touched. Don't open an XS brief for every row at once — the point is the voice, not a cleanup sprint.

---

## Cheat sheet

Print this. Keep it next to the keyboard.

- Say what it is. Say what it's for. Say what it's not for.
- A number beats an adjective.
- Admit the trade-off before the reader finds it.
- Name the person.
- If it's not ready, say "✦ Soon — [what]" and nothing more.
- Never apologise for the machine.
- Never greet the reader.
- Never say "Oops."
- Never say "Welcome."
- If you need an exclamation mark, you need a different sentence.
- Would Nikolai say it this way? If no, rewrite.

---

## When this guide changes

- A new surface (bookings, user accounts, messages) is added — add a *Patterns by surface* row with worked examples before the surface ships.
- A rule needs a carve-out — add it with the exception named (never silently loosen).
- The brand ethos changes — the top of this doc changes first; the rules re-derive.

Related: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md), [docs/MAP_MENU_ARCHITECTURE.md](docs/MAP_MENU_ARCHITECTURE.md), [docs/briefs/copy-style-nikolai.md](docs/briefs/copy-style-nikolai.md).
