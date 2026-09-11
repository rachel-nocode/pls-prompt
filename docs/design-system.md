# PlsPrompt — Monopo-inspired editorial direction

Updated September 10, 2026. This replaces ASCII Atelier on the public gallery and project pages. The site is a public read-only collection; former account, library and creator routes are removed while their database records remain preserved.

## Authoritative references

The user supplied DESIGN.md and three Monopo Saigon screenshots on September 10. Screenshots take precedence where the generated reference document differs: the actual target has a dark hero and pure-black gallery, with two staggered project columns. The previous white split hero and pastel orb were explicitly rejected and are not part of this design.

## Composition

- Full-viewport atmospheric hero with smooth dark sage/amber smoked-glass texture, fine grain and deep black pools; fades to black at the bottom.
- Small floating PlsPrompt wordmark and a subtle pill-shaped search input only. No rounded outer frame.
- One restrained centered white title: “Ideas, brought to life.” Roughly 54px at 1440px, not the oversized 225px value from generated documentation.
- Circular typographic scroll cue at lower left, aligned to body container.
- Pure-black selected-project section, 1078px maximum width, large vertical gaps, two columns offset by 140px with 64px gutter.
- Actual app screenshots appear without borders, card shells, shadows or grayscale filters. Their aspect ratio is preserved so app controls and labels are not cropped away. Titles and short descriptions remain understated below each image.
- On mobile, projects become one column and the hero title is 34px. Search remains visible and native controls stay reachable.

## Typography and palette

Use regular and light neutral sans serif. White primary copy on black, #999 supporting labels. No chromatic UI controls. Color belongs to atmospheric hero media and actual project screenshots. Pills for actions and header search; images and structural edges are square.

## Interaction

Search supports project title, summary and tags; category controls remain available. URL query/category state and return anchors preserve discovery context. Preview opens the real sandboxed demo and matching Markdown prompt; published prompts can be copied and downloaded free without accounts. Honor system reduced motion preferences. Images fade in over 1.25 seconds with cubic-bezier(.19,1,.22,1); hero moves gently only when allowed. Content remains visible without JavaScript or IntersectionObserver.

## Asset provenance

public/monopo-liquid-v2.png is an imagegen asset generated for this redesign using the supplied screenshot as a style reference; it contains no copied logo, UI or text. Supper Club and Window Seat previews are real screenshots of the implemented HTML demos. The app art is authored SVG/CSS and is independent of the gallery visual system.

## Release state

User approved the revised dark design, authorized public access without authentication, and requested a search-only header. Published September 10, 2026 as Sites version 13 at https://plsprompt.com with public audience. Anonymous navigation, copying and Markdown downloads verified in a fresh browser.

Prior design history: [ASCII Atelier](design-system-2026-09-05.md).
