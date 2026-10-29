# UI/UX guide (every project)

How to use it:
- Read it before building or changing any screen, page or flow.
- Skip the sections whose "When" doesn't apply.
- The project's own design docs (tokens, components, brand) come first for
  look and feel; this file covers how screens must behave and be organised.
- The reviewer subagent uses the checklist at the end on every batch that
  changes a screen.

---

## 0. Identity first — when starting a new product

- **Before building any screens, write a short design direction:**
  - who it's for, and the mood;
  - a small palette (4–6 tokens);
  - a type pairing;
  - one signature element (a shape, a motif, a way of moving) that makes it
    recognisable.
- **Critique it:** "would this look like every other app?" If yes, change it.
  Avoid the generic defaults: the system font only, neutral grey and blue,
  identical rounded cards, stock icons used everywhere.
- **The rules below shape behaviour, never the look.** Two products that
  follow this whole guide should still look nothing alike.

## 1. Core principles — always

- **Simplicity:** one main goal per screen. Remove anything that doesn't
  serve it.
- **Visual hierarchy:**
  - The most important thing is the most prominent, and there is one primary
    action per screen.
  - Order the rest by size, weight, colour and position, in order of
    importance.
  - The single item that looks different gets noticed (Von Restorff), so
    spend that only on the primary action.
- **Feedback and responsiveness:**
  - Every action gets a visible response within ~100 ms.
  - Anything slower than ~400 ms shows progress (the Doherty threshold;
    people stay in flow below it).
  - Users always know what the system is doing.
- **Accessibility:** see §9. It is not optional.
- **Consistency (Jakob's law):** users expect your product to work like the
  ones they already use. Follow platform conventions; the same action looks
  and works the same everywhere in the product.
- **User control:** undo and cancel wherever possible; the user is never
  trapped (there is always a way back or out).
- **Recognition over recall:** show options and context; don't make people
  remember things from another screen.
- **Tesler's law:** some complexity can't be removed. The product absorbs it
  (smart defaults, autofill, parsing), not the user.
- **Postel's law:** accept messy input (spaces, case, pasted codes, other
  formats) and normalise it; output clean, consistent results.
- **Aesthetic-usability effect:** a polished look makes the product feel
  easier and earns patience. Polish matters, but never at the cost of
  usability.

## 2. Perception and grouping — always

- **Proximity:** items close together read as a group. Spacing is the
  cheapest way to group things.
- **Similarity:** items that look alike seem to do the same thing. Same style
  for the same function, different style for different functions.
- **Common region:** a shared background or border groups items.
- **Uniform connectedness:** related items are visually connected (a shared
  box, a line, a colour); unrelated ones are not.
- **Closure and Prägnanz:** people complete simple shapes and see the
  simplest form. Use simple, recognisable shapes and icons; don't over-draw
  borders where grouping already shows.
- **Figure-ground:** the foreground is clearly separated from the background.
  Modals dim what's behind them, and text never sits on a busy image without
  an overlay.
- **Chunking (Miller's law):** break information into small groups of up to
  about 5–7 items: codes as `ABC-123-XYZ`, long forms as steps, long pages
  as sections.

## 3. Decisions and behaviour — always

- **Choice overload and Hick's law:** decision time grows with the number of
  options. Offer few choices per decision, with a recommended default, and
  hide advanced options until asked for (progressive disclosure).
- **Fitts's law:** frequent and important targets are large and near the
  thumb or cursor; destructive ones are smaller and farther away.
- **Serial position:** the first and last items are remembered best, so put
  key items there (navigation, lists, onboarding).
- **Peak-end rule:** people judge an experience by its best moment and its
  end. Make finishing feel good: a clear result, a celebration, a next step.
- **Goal gradient and the Zeigarnik effect:** visible progress and unfinished
  tasks motivate ("2 of 4 groups found", a progress bar, "continue where you
  left off").
- **Parkinson's law:** tasks expand to the time allowed. Set short, clear
  expectations ("about 1 minute"); autofill and defaults keep tasks short.
- **Banner blindness:** people skip anything that looks like an ad or a
  banner. Put important messages inside the user's task, in the same style as
  the content, never in banner-like boxes at the edges.

## 4. Layout and visual system — always, for anything with a screen

- **Spacing:** a scale (4 or 8 pt steps), a grid, consistent margins.
- **Responsive and mobile-first:** design for the smallest screen first. Mind
  safe areas (notches, the home bar, rounded corners). No horizontal
  scrolling on pages.
- **Typography:**
  - at most two typefaces, and a type scale;
  - body text at least 16 px (or the platform default);
  - lines of 45–75 characters, line height about 1.4–1.6;
  - text that scales with the user's settings.
- **Colour:**
  - a small token palette;
  - contrast of at least 4.5:1 for text, and 3:1 for large text, icons and
    control borders;
  - meaning never by colour alone (add an icon, text or pattern);
  - designed for both light and dark mode.
- **Design system:** shared tokens and components. No one-off styles; a new
  pattern becomes a component.

## 5. Interaction — always, for anything with a screen

- **Touch and click targets:** at least 44×44 pt (iOS) or 48×48 dp (Android
  and web), with space between them.
- **Buttons say what they do** ("Save word", "Send code"), not "OK" or
  "Submit".
- **States for every control:** default, pressed, focused, disabled,
  loading.
- **Destructive actions:**
  - offer undo where possible;
  - otherwise ask for confirmation, naming what will be lost;
  - the destructive button looks distinct, and is never the default or the
    most prominent option.
- **Gestures:** always have a visible alternative; never the only way to do
  something.
- **Motion:**
  - purposeful: it shows where things come from and go, and gives feedback;
  - 150–300 ms, with easing;
  - respects Reduce Motion;
  - never blocks input.

## 6. Forms and input — when there are inputs

- A visible label for every field (a placeholder is not a label).
- Ask only for what's needed; mark optional fields, not required ones.
- The right keyboard type, autofill and autocomplete hints, sensible
  autocapitalisation.
- **Validation:** check inline on leaving a field and again on submit; show
  errors next to the field, in plain words, saying how to fix it.
- **Never lose input:** keep what was typed after an error, a reload or a
  network failure.
- Accept flexible formats (Postel's law); format as the user types where it
  helps (codes, phone numbers).

## 7. Navigation and structure — always

- The user always knows where they are, how they got there and how to go
  back. Back works as the platform expects (the Android back button,
  browser history).
- 3–5 top-level destinations at most; group the rest.
- Deep links and shared links open the right place, even when the user isn't
  signed in or the app is cold-started.
- Search where content is large; filters show what is active and how to
  clear them.

## 8. States and messages — always, for anything with a screen

- **Design every state:** loading (skeletons beat spinners for content),
  empty, error, offline, partial, success. See also `LAUNCH.md` §5.
- **Empty states** explain what will be here, and offer the first action.
- **Error messages:**
  - say what happened and what to do next, in plain words;
  - never a raw code or a stack trace;
  - never blame the user.
- **Prevent errors before reporting them:** constraints, defaults,
  confirmations, disabled states that say why.
- **Notices:** short-lived ones for confirmations (toasts), blocking dialogs
  only for decisions. Never stack several at once.

## 9. Accessibility — always (WCAG 2.2 AA)

- **Contrast and colour:** see §4.
- **Labels:** every control has an accessible name and role (screen
  readers). Decorative images are hidden; meaningful ones have alt text.
- **Text and zoom:** works at the largest system text size and 200% zoom
  without cut-off or overlapping text.
- **Keyboard (web):** everything is reachable and usable by keyboard, with a
  visible focus ring, a logical focus order, and no focus traps. Dialogs
  move focus in and return it.
- **Changes are announced:** dynamic changes (toasts, errors, results) reach
  screen readers through live regions or announcements.
- **Motion:** respect Reduce Motion; nothing flashes more than 3 times a
  second.
- **Time limits:** none without a way to extend them, unless the timing is
  the point of the game.
- **Testing:** test with the platform screen reader (VoiceOver, TalkBack) on
  the main flows before a release.

## 10. Content and microcopy — always

- Plain, short, active sentences in the user's language; the same word for
  the same thing everywhere.
- Front-load the key words (headings, buttons, notifications).
- Numbers, dates and currencies in the user's locale format.
- Leave room for longer translations (Hungarian and German run 30%+ longer
  than English); support right-to-left layouts if those languages are
  planned.

## 11. Onboarding and help — when there are new users

- Let people do the main thing quickly; teach in context at the moment
  it's needed, not with long upfront tours.
- Tours and tips can be skipped and are never shown again once dismissed;
  help stays reachable later (a rules or help screen).
- Ask for permissions (notifications, location, camera) in context, right
  before the feature needs them, and explain why. Work without them.

## 12. Performance as UX — always

- Perceived speed matters as much as real speed: instant feedback,
  optimistic updates (with rollback on failure), skeletons, preloading the
  likely next step.
- Small bundles and images, fast start-up, no layout shift while loading
  (budgets: `LAUNCH.md` §3; web specifics: §6).

## 13. Notifications — when the product sends them

- Only for things the user cares about, in the user's language, never
  marketing disguised as information.
- Tapping one opens the right place.
- They are easy to turn off, by type.

## 14. Trust and ethics — always

- **No dark patterns:**
  - hidden costs;
  - pre-ticked consent;
  - forced continuity;
  - confirm-shaming;
  - fake urgency or scarcity;
  - disguised ads;
  - cancellation that is hard to find.
- Clear pricing: what is free, what costs money, before the user commits.
- Say what happens to the user's data, in plain words, where it matters.

## 15. Validation — before a release

- Look at the real screens: screenshots on real device sizes, light and
  dark mode, the largest text size. Tests alone don't show what users see.
- A heuristic review with the checklist below.
- Watch at least one real user try the main flow when you can; fix what
  confuses them first.

---

## Review checklist (for the reviewer and before a release)

Based on Nielsen's 10 heuristics plus the states:

1. **Status:** can the user always tell what's happening (feedback within
   ~100 ms, progress for slow actions)?
2. **Real-world match:** does the screen use the user's words and a natural
   order?
3. **Control:** can the user undo, cancel, go back, and never get trapped?
4. **Consistency:** does it look and work like the rest of the product and
   the platform?
5. **Error prevention:** are mistakes prevented, and destructive actions
   confirmed or undoable?
6. **Recognition:** are options visible, so nothing has to be remembered?
7. **Efficiency:** are there defaults, shortcuts, and few steps for frequent
   tasks?
8. **Minimalism:** does each screen have one clear primary action and nothing
   extra?
9. **Error recovery:** do messages say what happened and how to fix it, with
   input kept?
10. **Help:** are rules or help reachable when needed?
11. **States:** are loading, empty, error, offline and success all designed?
12. **Accessibility:** are contrast, labels, large text, targets of 44/48 and
    Reduce Motion all covered?
