# Motion audit — 26 October 2026

Read-only analysis completed before implementation. Scope: all heroes, shared animated text/Lottie players, clients, quotes, timeline and collaboration blocks. Stack: Motion/LazyMotion, Splide, Lottie SVG, Tailwind. Brand: restrained dark/turquoise professional portfolio. No new dependencies or CMS data changes.

## Verified findings and execution plan

| Priority | Before | After planned | Cause / purpose |
| --- | --- | --- | --- |
| High | `AnimatedText.tsx:14`: block `div` inside `h1`, fixed 1.2em clipping; infinite phrase rotation | Phrasing-only spans; reserve the largest CMS phrase in a grid; explicit pause/resume, stable screen-reader text; 200ms opacity/transform crossfade | Invalid heading markup, long phrases clipped, layout shifts and no pause control |
| Medium | `HeroIcons.tsx:11`: scroll-driven decorative translation, 0.5s delay + 0.8s fade | Static icon strip, immediately visible | Parallax adds scroll work and delays decorative information without improving orientation |
| High | `ClientsSlider/Component.client.tsx:35`: endless marquee, only transient hover/focus pause | Persistent explicit pause button; stop outside viewport/hidden tab; reduced-motion stops automatically | Continuous motion needs user control; background animation wastes CPU |
| Medium | `LottiePlayer.tsx:34`: completion only; ongoing playback persists offscreen | Pause outside viewport and when document is hidden; preserve reduced-motion and once-on-mobile behavior | Offscreen SVG updates and hidden-tab animation work |
| Medium | `ClientQuotes/Component.client.tsx:32`: 600ms slide transition | 250ms `cubic-bezier(0.23, 1, 0.32, 1)`; zero movement for keyboard controls/reduced motion | Slow frequent navigation; easier reading |
| Medium | Timeline uses default slide transition and two icon subtrees per item | Same 250ms/keyboard/reduced-motion policy; one responsive icon per item | Unnecessary duplicated Lottie DOM; movement during keyboard use |
| Medium | `CopyButton.tsx`: rejected clipboard promise is unhandled; English response | German inline success/error status with timer cleanup; no added toast or animation | Reliable completion/error feedback |

Implementation is a separate, user-authorized `animate` / `animation-performance` step after this audit. Shared CSS/tokens remain with the main agent. Existing CMS interfaces and content stay unchanged. Verify by targeted integration tests, then main-agent browser checks on mobile/desktop, reduced motion, logo pause, quote/timeline controls and long hero phrases. Real-device FPS and Safari profiling remain unverified.

## Opportunities gate

| Location | Today | Purpose | Frequency | Suggested motion |
| --- | --- | --- | --- | --- |
| Hero phrase change | 400ms slide with a blank wait between phrases | Preventing a jarring change | Occasional automatic marketing text | 200ms full `transform: translateY(8px)` + opacity to settled, `cubic-bezier(0.23, 1, 0.32, 1)`, no initial entrance, reduced motion static; stable reserved dimensions |

Rejected: whole-page scroll reveals (reading must be immediate); collaboration orbit (pure decoration, no explanatory gain); Lottie hover enlargement (SVG already supplies feedback, extra motion has no purpose); animated copy-result morph (keyboard-triggered action must respond immediately). No new decorative motion is justified.

Vocabulary: **Crossfade** — One element fades out as another fades in, in the same spot. **Marquee** — Text or content that scrolls continuously in a loop. **Parallax** — Background and foreground move at different speeds while scrolling, creating depth. **Reduced motion** — Respecting the user's prefers-reduced-motion setting by toning down or removing motion.

## Skills

Applied: improve-animations (analysis first), find-animation-opportunities (gated additions/rejections), animation-vocabulary (precise naming), animate (authorized execution after analysis), animation-performance (offscreen/background work, full transforms), review-animations (final strict code review). References read: AUDIT.md, PLAN-TEMPLATE.md, RECIPES.md, STANDARDS.md; local Next server/client and image documentation. No Expo/React Native or Swift files exist in this scope.

## Final verification

Implementation completed as a separate step after the read-only audit. No dependencies, CMS schemas or stored content changed.

- Scoped ESLint: passed with zero errors/warnings.
- Four targeted Vitest suites: **11/11 passed**. Covers valid heading markup, persistent pause/resume and stable assistive text, empty phrase lists, clipboard success/failure/timer cleanup, Lottie viewport/tab-visibility pause/resume/observer cleanup, server-rendered hero visibility, PDF download rendering, dimensionless image fallback, retained image dimensions and user-controlled video without autoplay/download.
- The restricted test runtime intermittently lost temporary transformed modules (`ENOENT`). The same two suites passed together when executed with the normal local runtime. This was an execution-environment failure, not an assertion failure.
- Typecheck found no errors in the motion files; at the time it ran, it was blocked by concurrent temporary prototype routes (`/prototypes/form-edge-cases` generated types and the navigation prototype's union global type). Integrated final typecheck belongs to the main agent after prototype cleanup.
- Browser feel checks, viewport dimensions, real-device FPS/Safari and slow-motion inspection are not claimed here. The main agent coordinates integrated desktop/mobile/reduced-motion checks.

### Strict motion review

| Before | After | Why |
| --- | --- | --- |
| 400ms wait-mode phrase transition with an invalid block wrapper | 200ms `transform`/opacity crossfade, no initial entrance, explicit pause and reserved phrase dimensions | Contents remain immediately readable; controlled automatic change |
| Scroll-bound parallax on decorative hero icons | Static, immediately visible server-rendered strip | No useful spatial relationship was communicated by the motion |
| 600ms quote slide | 250ms strong ease-out; keyboard/reduced-motion controls use zero duration | Matches interaction frequency and avoids vestibular movement |
| Continuous unseen logo/Lottie work | Viewport/visibility-aware pause; persistent marquee control | Stops work that cannot benefit the visitor |
| New decorative effects available | None added | Page reveals, orbit, hover enlargement and copy-result morph fail the purpose/frequency gate |

**Code-review decision: Approve within this motion scope**, subject to the integrated browser checks above. No new `transition: all`, layout-property animation, `scale(0)`, hover motion, artificial UI delay or animation dependency was introduced. Existing Splide drag physics remain library-managed. Functional keyboard feedback is immediate.

## Independent integration review and authorized follow-up

Read-only review covered the final forms, cookie banner, deferred chat, root layout/styles/buttons, media components and providers. No page-transition wrapper exists. Providers already defer Motion features; no additional library change was justified. Form/chat spinners have reduced-motion alternatives; form success/error states expose inline feedback and focus targets. The chat stream already throttles text updates to 50ms; no speculative rewrite was justified. Cookie transitions use opacity only. Existing global quote/pagination CSS findings were returned to the main agent for central correction.

The independent review identified these confirmed issues; the main agent explicitly expanded this agent's implementation scope:

| Before | After | Why |
| --- | --- | --- |
| Pause control nested in `h1`; its changing accessible label and all phrases entered heading navigation | Control sits below `h1`; accessible name is explicitly the first CMS phrase plus title | Predictable screen-reader heading navigation while retaining every authored visual phrase |
| Video loops/autoplays with no pause control for ordinary visitors; eager media loading | Native video controls, no autoplay/loop, `preload="none"`, existing intrinsic dimensions reserve space | Visitors choose playback; no unnecessary initial video transfer or perpetual playback |
| CMS permits PDFs, but Media passes them to NextImage | Named PDF download link | Prevents unsupported document/image rendering |
| Legacy CMS image without dimensions throws in NextImage | Reserved aspect-video frame and `fill`, retaining alt text | Incomplete media data no longer breaks the page |
| Project-detail whole-page fade, image hover zooms and moving CTA | Immediate readable page; static project imagery; explicit color transition only | No motion is needed to interpret static case-study information |
| White lettering on turquoise demo CTA | `text-accent-foreground` | Reuses the site's high-contrast accent pairing |
| Project case study skips from h1 to h3/h4 | Section-level h2 hierarchy; min-width and missing hero-image URL safeguards | Clear document structure and resilience with long/incomplete content |

The 11 assertions passed across two test commands; lint of the authorized source/test files also passed. Browser/player codec behavior, captions/transcripts for editorial videos, and physical-device performance are not claimed. No CMS content was modified or external demo links opened.

Final central integration: Splide assigns `group` to slides after mounting. Neutral `div` slide/list containers replace the proposed `ul/li` markup to avoid invalid `li[role=group]`; the existing browser semantics regression passes. Root styles remove duplicate quote content motion, retain SSR visibility, and give quote pagination44px controls. The complete stable-build browser run passes reduced motion, priority image dimensions, filters, single-quote behavior and persistent pause controls. Local six-run lab checks recorded CLS0; no field/FPS improvement claim. See the shared website audit for exact coverage and limits.
