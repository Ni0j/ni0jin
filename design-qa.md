# Design QA

**Source visual truth**

- Selected visual target: `/Users/nioion0/.codex/generated_images/01a0cc32-8f44-7e01-a47c-d24dda714f9b/exec-ea9aa0ae-b784-4aba-9279-efc3d02d0908.png`.
- Supporting taste reference: `/Users/nioion0/Documents/Codex/2026-09-20/h/design/TASTE.md`.
- Direction: quiet Swiss/editorial typography, MoMA/Pentagram restraint, warm paper/ink/oxblood palette, and no SaaS card language.
- Asset rule: generated imagery appears only on the sēzn landing page. The Venti and Monta Tea case studies use restaurant-sourced photography; the Monta Tea result uses the supplied screen recording.

**Implementation evidence**

- Landing: `http://127.0.0.1:4173/restaurants/`
- Contact: `http://127.0.0.1:4173/restaurants/contact/`
- Venti case: `http://127.0.0.1:4173/restaurants/work/venti/`
- Monta Tea case: `http://127.0.0.1:4173/restaurants/work/monta-tea/`
- Desktop comparison viewports: 789 × 790 CSS px for the source-artboard match and 1180 × 790 CSS px for the latest browser annotations.
- Mobile review: 390 × 844 CSS px.
- Implementation screenshots: captured inline from the in-app browser; the capture API did not expose a persistent filesystem path.
- Browser console review: no warnings or errors on the landing page or either case page.

## Full-view comparison evidence

The landing page keeps the approved reference's warm-white ground, serif-led hierarchy, asymmetric image/type relationship, dark service state, alternating work rows, and spare typographic close. At the reference-width comparison, the hero now uses the same three-line title structure—“Websites / with a point / of view.”—with a controlled paper-colored extension into the photograph.

The result intentionally avoids the reference's decorative labels and arrow motifs. Links are underlined text only; hover and keyboard focus introduce italics rather than adding icons, pills, or movement.

## Focused-region comparison evidence

- Brand and hero: `sēzn` uses Cormorant Garamond; the hero and editorial statements use Newsreader. Display tracking and leading are relaxed across the site. The hero title overlaps the image on a paper-colored field while the photograph is repositioned so the wine glass remains fully visible.
- Services: Cold reach and Regular service are clear, mutually exclusive disclosure rows. Their labels, titles, descriptions, and CTAs share fixed column lines in both expanded states. They work by pointer and button activation and expose `aria-expanded`.
- Selected work: only “Case study” is offered. There is no live-concept link or route from the commercial landing page.
- Venti case: rebuilt in the sēzn type, color, spacing, and narrative system; all visible case imagery is restaurant-sourced.
- Monta Tea landing preview: the supplied MP4 reports an intrinsic size of 1080 × 1350. Its desktop container is height-led with width derived from the same native 4:5 ratio; mobile becomes width-led at 4:5. It uses `object-fit: contain`, with no synthetic 16:9 crop or parallax scaling.
- Monta Tea case: rebuilt in the same system and continues to use restaurant-sourced imagery plus the supplied MP4.
- Status language: project-status lines were removed from the landing work index; the detailed case pages retain their factual concept-study context.
- Mobile: landing, accordions, case heroes, editorial narratives, result media, footers, and CTA flow all collapse without horizontal overflow.

## Motion and interaction evidence

- Hero copy and media use independent parallax rates.
- Work imagery and case imagery use scroll-linked clip/reveal motion where supported.
- Large positioning type settles as it enters the viewport.
- Sections use restrained IntersectionObserver reveals.
- Service rows use a one-open-at-a-time disclosure pattern rather than static cards.
- All motion is disabled or flattened under `prefers-reduced-motion: reduce`.

## Required fidelity surfaces

- Typography: passed. The original Cormorant Garamond and Newsreader pairing is restored across landing, contact, and case pages. Supporting copy and text links now match the `.84rem` header scale; large serif styles use less-negative tracking and more generous line height. The hero remains three lines, “Monta Tea” remains one line, and the closing process statement has more breathing room.
- Layout rhythm: passed. Desktop and 390 px mobile retain deliberate whitespace, strong section changes, and obvious next actions.
- Color and materials: passed. No gradients, rounded cards, decorative shadows, or fashionable SaaS chrome were introduced.
- Asset fidelity: passed. Generated assets are restricted to the landing page. Case studies use existing restaurant imagery and the user-supplied Monta Tea video.
- Copy: passed. No live-concept invitation, arrow CTA, commission/approval wording, or generated-client-image implication remains.
- Accessibility: passed. Semantic headings, labels, alt text, focus states, accordion state, and reduced-motion behavior are present.

## Primary interactions tested

- Header navigation and anchored sections.
- Cold reach ↔ Regular service accordion on desktop and mobile.
- Both accordion states at the 1180 × 790 annotation viewport, including shared title/description alignment.
- Landing-to-case navigation for both projects.
- Monta Tea video autoplay/loop and native-ratio presentation.
- Mobile overflow and native 4:5 media sizing at 390 × 844.
- Case-to-contact and case-to-work navigation.
- Mobile landing and both case heroes at 390 × 844.

## Findings

- No actionable P0, P1, or P2 findings remain.

## Comparison history

- P2: the 789 px reference-width viewport previously crossed the service site's mobile breakpoint, stacking the hero and losing the mock's image/type overlap. Fix: moved the service breakpoint to 700 px, restored the desktop split at 789 px, and verified the wine glass remains unobscured.
- P2: the Monta Tea landing video was forced into a 16:9 frame although its intrinsic ratio is 4:5. Fix: changed the frame to 4:5, removed video parallax/cropping, and verified 1080 × 1350 source dimensions with no horizontal overflow.

final result: passed
