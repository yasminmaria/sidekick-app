---
name: Sidekick
description: A gamified daily companion for adults with ADHD — a calm forest of warm structure for minds that need a grounding signal.
colors:
  growth-green: "#0F6E56"
  growth-green-deep: "#0B6450"
  growth-green-light: "#E1F5EE"
  spring-green: "#17E375"
  mint: "#9FE1CB"
  teal-bright: "#1D9E75"
  sage-canvas: "#F4F7F4"
  surface-white: "#FFFFFF"
  surface-sunken: "#EEF1EE"
  forest-ink: "#0E1A16"
  forest-ink-soft: "#15201B"
  text-secondary: "#5C6A62"
  text-muted: "#647067"
  border-mist: "#EBEEEB"
  border-soft: "#EEF1EE"
  divider: "#F0F2F0"
  warmth-pink: "#D4537E"
  warmth-pink-deep: "#B23866"
  warmth-pink-light: "#FBEAF0"
  energy-amber: "#EFA436"
  energy-amber-deep: "#D98A12"
  energy-amber-text: "#9A6312"
  energy-amber-light: "#FAEEDA"
  momentum-coral: "#D2733E"
  card-dark: "#0E1A16"
  decor-ash: "#A2ABA4"
  decor-ash-faint: "#B4BDB5"
typography:
  display:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.5px"
  headline:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.5px"
  title:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.3px"
  body:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  eyebrow:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "12px"
    fontWeight: 800
    letterSpacing: "0.6px"
rounded:
  sm: "7px"
  md: "12px"
  lg: "18px"
  xl: "24px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.growth-green}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "16px"
  button-primary-pressed:
    backgroundColor: "{colors.growth-green-deep}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "16px"
  button-spring:
    backgroundColor: "{colors.spring-green}"
    textColor: "{colors.forest-ink}"
    rounded: "14px"
    padding: "14px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "16px"
  button-danger:
    backgroundColor: "{colors.momentum-coral}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "16px"
  button-dashed:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.growth-green}"
    rounded: "{rounded.lg}"
    padding: "15px"
  segment-active:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.growth-green}"
    rounded: "11px"
    padding: "10px"
  segment-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "11px"
    padding: "10px"
  pill-active:
    backgroundColor: "{colors.growth-green}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    padding: "7px 14px"
  pill-inactive:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.full}"
    padding: "7px 14px"
  card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  tile-icon-teal:
    backgroundColor: "{colors.growth-green-light}"
    textColor: "{colors.growth-green}"
    rounded: "{rounded.md}"
    size: "40px"
  input:
    backgroundColor: "{colors.sage-canvas}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.md}"
    padding: "16px"
  level-badge:
    backgroundColor: "{colors.spring-green}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.sm}"
    size: "22px"
  badge-teal:
    backgroundColor: "{colors.growth-green-light}"
    textColor: "{colors.growth-green}"
    rounded: "{rounded.sm}"
    padding: "3px 8px"
  badge-amber:
    backgroundColor: "{colors.energy-amber-light}"
    textColor: "{colors.energy-amber-text}"
    rounded: "{rounded.sm}"
    padding: "3px 8px"
  badge-pink:
    backgroundColor: "{colors.warmth-pink-light}"
    textColor: "{colors.warmth-pink-deep}"
    rounded: "{rounded.sm}"
    padding: "3px 8px"
---

# Design System: Sidekick

## 1. Overview

**Creative North Star: "The Growth Garden"**

Sidekick is built for minds that bloom at their own pace. The system is a garden rooted in deep forest greens, reaching toward the bright spring-green of new growth. Every screen is a well-tended plot: calm, legible, purposeful. Progress is always visible because plants don't hide their growth, and rewards feel earned because a bloom is evidence, not decoration. The headers are the soil line, deep and grounding; the spring-green accent is the first shoot breaking through.

The system rejects clinical distance. No hospital-white sterility, no corporate blue-gray, no status-bar anxiety, no red-alert shaming. It also rejects the children's-app reflex: gamification here is mature and earned, never shrieking. The goal is ambient calm with persistent momentum, the app whispers forward, it never shouts. Structure motivates; it does not constrain.

Depth comes mostly from tonal layering, the sage-canvas base under surface-white cards bounded by 1px borders, but the redesign earns three deliberate moments of real elevation: the green gradient headers, the dark gradient "hero" cards (Foco agora, the goals donut, goal cards), and the floating chat button. These are the bloom moments; everything else stays flat and quiet so they read.

**Key Characteristics:**
- Green is the identity: a single forest-green primary (#0F6E56) carries brand, action, and achievement
- Tonal layering for the everyday surface; deliberate gradient + shadow only on hero moments
- A warm multi-accent system where amber, pink, and dark tiles mark territory now that green is the brand
- System fonts tuned to heavy weight contrast (800 for headings, 500 for body); no decorative type
- Line icons (lucide set) over emoji for UI chrome; emoji reserved for user-chosen habit/mood expression
- Every tone is companion-toned: no punitive copy, no shame states, no red-alert patterns
- Brazilian Portuguese throughout

## 2. Colors: The Growth Garden Palette

One green carries the brand. The canvas is green-tinted. The warm accents mark territory and reward.

### Primary
- **Growth Green** (#0F6E56): The identity and action color. Primary buttons, active segment/tab text, progress fills, the "Foco agora" eyebrow, completed-state checks, and headline accents all speak this green. If something is interactive, achieved, or branded, it is this color.
- **Growth Green Deep** (#0B6450): Pressed states and the deeper end of progress gradients. The shade of commitment.
- **Growth Green Light** (#E1F5EE): The ghost variant: teal-tile backgrounds, count pills, badge fills. Green without weight.

### Secondary
- **Spring Green** (#17E375): The reward accent, the bright shoot. The level badge, the XP-bar gradient head, the "Concluir agora" button, the "Agora" timeline marker. High-energy, used in small doses against the dark gradient cards where it glows.
- **Mint** (#9FE1CB): The soft tail of gradients (XP bar, avatar ring) and decorative accents on dark surfaces.
- **Teal Bright** (#1D9E75): The lighter live-green for the gradient header crown, the home-button gradient, and the Agenda weekday eyebrow. A brighter sibling of the primary, never an action color on its own.

### Tertiary (territory + reward accents)
- **Warmth Pink** (#D4537E) / **Pink Deep** (#B23866): The mood (Humor) territory color. Mood chips, the low-stock medication alert, the destructive "Resetar/Sair" row. Pink Deep is the text-on-pink-tint shade (over #FBEAF0).
- **Energy Amber** (#EFA436) / **Amber Deep** (#D98A12): Reward, streak, and coins. The streak-stat gradient card, flame icons, the energy scale, the consistency "dias seguidos" pill. **Amber Text** (#9A6312) is the only amber legible as text on the amber-light (#FAEEDA) fill.
- **Momentum Coral** (#D2733E): Reserved strictly for danger and the "pra baixo" mood tone. The lowest-priority accent; if you reach for coral as decoration, stop.

### Neutral
- **Sage Canvas** (#F4F7F4): The screen background. A light gray-green tinted toward the brand's own hue. Never warm-neutral.
- **Surface White** (#FFFFFF): Cards, modals, inputs in primary variant. One raised step above the canvas.
- **Surface Sunken** (#EEF1EE): Segmented-control trough, completed-task tiles, progress-bar tracks. One step *below* the surface.
- **Forest Ink** (#0E1A16) / **Forest Ink Soft** (#15201B): Primary text. Near-black green, anchored to the garden. Soft is the slightly lifted variant for card titles.
- **Text Secondary** (#5C6A62): Metadata and supporting copy ("Tarefa · Média", habit sub-lines, med form, section counts). Clears 5.7:1 on white, 5.3:1 on canvas, 5.0:1 on sunken. The *floor* for text that carries words.
- **Text Muted** (#647067): The smallest meta (timestamps, scale end-labels, "restam"). Clears 5.2:1 on white, 4.8:1 on canvas, 4.6:1 on sunken.
- **Border Mist** (#EBEEEB) / **Border Soft** (#EEF1EE) / **Divider** (#F0F2F0): Card borders, dashed-add outlines, settings-row dividers. Present on every resting card.
- **Card Dark** (#0E1A16): The base of the dark gradient hero cards. Text on it is white.
- **Decor Ash** (#A2ABA4) / **Decor Ash Faint** (#B4BDB5): **Non-text only.** Empty progress-track tints, decorative dots, inactive heatmap cells. Never carry words in these.

### Named Rules

**The One Green Rule.** Growth Green (#0F6E56) is the brand and the only action color. It need not be rationed the way the old lavender was, but it earns meaning by never being faked: a green element is interactive, branded, or achieved, never a decorative wash.

**The Territory Rule.** Now that green is the brand, domain is carried by the warm accents and the dark tile, not by green. Amber tiles/cards mean reward and streaks; pink means mood; the dark (#0E1A16) tint marks deep-focus and hero moments; coral means danger. A teal/green tile is the neutral default, not a territory signal. Don't use a warm accent outside its domain; that breaks the map.

**The Text-Contrast Floor Rule.** Any color carrying words must clear WCAG AA against its surface (4.5:1 body; 3:1 for ≥18px or bold ≥14px). Text Secondary (#5C6A62) and Text Muted (#647067) are the documented floors; Decor Ash and Decor Ash Faint are prohibited as text. *"Muted gray on near-white is not acceptable"* (PRODUCT.md).

## 3. Typography

**Display / Body Font:** System (SF Pro on iOS, Roboto on Android)
**Mono:** Not used

**Character:** Sidekick uses the platform system font throughout, a deliberate choice. System fonts carry zero cognitive overhead, render crisply at every size, and match the ambient trust of a native companion. Hierarchy is built entirely from weight and scale contrast: headings run heavy (800), body sits mid (500), and the gap between them does the work a second typeface would. If a custom face is ever introduced, the direction is a warm humanist sans (Plus Jakarta Sans, Nunito, DM Sans); a geometric sans reads too corporate, a serif too editorial for a daily utility.

### Hierarchy
- **Display** (800, 28px, 1.2 lh, −0.5px tracking): The greeting heading on Home. One per screen; the page's name, not a section title.
- **Headline** (800, 24px, 1.2 lh, −0.5px): Screen titles ("Cuidados", "Minhas metas", the Agenda date). The top of most non-Home screens.
- **Title** (800, 17px, 1.3 lh, −0.3px): Card headers, the Foco card title, goal names. The workhorse in-list heading.
- **Body** (500, 15px, 1.5 lh): Running copy, task and habit names, input text. Cap prose at 65–75ch (rarely reached on mobile).
- **Label** (600, 13px, 1.4 lh): Form labels, segment text, secondary buttons. Medium weight holds legibility small.
- **Caption** (500, 12px, 1.4 lh): Metadata, counts, XP fractions, badge text.
- **Eyebrow** (800, 12px, +0.6px tracking, UPPERCASE): Used once, deliberately, for the "FOCO AGORA" label above the hero card and the Agenda weekday. Reserved, not a per-section scaffold.

### Named Rules

**The Weight-Contrast Rule.** Hierarchy comes from weight (800 vs 500), not from a fluid type scale. Sizes are fixed px, not clamp(); a mobile companion is viewed at consistent DPI, and shrinking headings in a small viewport looks worse, not better.

**The One-Eyebrow Rule.** The uppercase tracked eyebrow appears on the Foco label and the Agenda weekday only. It is a deliberate brand accent, not scaffolding. Never put a tracked all-caps kicker above every section.

## 4. Elevation

Sidekick is flat by default and lifts only on purpose. The everyday surface is tonal: sage-canvas (#F4F7F4) base, surface-white (#FFFFFF) cards, a 1px border-mist edge, no resting shadow. Depth on ordinary cards comes from the canvas → surface stack, never from a glow.

Three moments earn real elevation, and only these: the green gradient headers (Home, Perfil), the dark gradient hero cards (Foco agora, the goals donut, the gradient goal cards), and the floating chat button. Bottom-sheet modals use a 40% black scrim. The elevation is the bloom; it works because everything around it stays flat.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 8px 18px rgba(14,26,22,0.08)`): The overlapping Perfil progress card and surfaces that sit just above the canvas. Barely there.
- **Hero raise** (`box-shadow: 0 16px 30px rgba(14,26,22,0.22)`): The Foco agora card and the level-up toast. The single most-lifted element on a screen.
- **FAB** (`elevation: 6`, green-tinted): The chat button floating above scroll content.

### Named Rules

**The Flat-By-Default Rule.** Resting cards, inputs, tiles, and buttons carry no shadow. If an ordinary list card looks lifted, it is off-system. Shadow is reserved for the three hero moments above. Test: if you can't name which of the three a shadow belongs to, delete it.

## 5. Components

### Buttons
- **Shape:** Gently rounded (12px, `rounded.md`) for form/modal actions; 14px for the spring-green hero action; full radius for pills.
- **Primary:** Growth Green (#0F6E56) fill, white text (700–800), 16px padding. Full-width in modal action rows. Pressed → Green Deep (#0B6450).
- **Spring (hero action):** Spring Green (#17E375) fill, Forest Ink text, 14px radius. The "Concluir agora" call to action on the dark Foco card, where bright green on near-black is the reward signal.
- **Secondary:** Transparent fill, 1px Border Mist border, Text Secondary label. The cancel/back option, paired left of Primary.
- **Danger:** Momentum Coral (#D2733E) fill, white text. Destructive only.
- **Dashed add:** Surface-white fill, 2px dashed #CBD4CC border, Growth Green label + plus icon. The lowest-weight "create" affordance ("Nova meta", "Novo hábito", "Adicionar ao dia").
- **Disabled:** Surface Sunken fill, muted label. A flattened fill or opacity; never a half-colored accent.

### Chips, Pills, and Segmented Control
- **Count/status pills:** Green Light (#E1F5EE) fill, Growth Green text, full radius ("3 restantes", "5 pendentes").
- **Filter pills:** full radius; inactive is white on canvas with a border, active fills Growth Green.
- **Segmented control (Cuidados):** a Surface Sunken (#EEF1EE) trough holding three segments; the active segment is white with a soft card-lift shadow and Growth Green text, inactive is transparent with Text Secondary. The standard in-screen mode switcher.
- **Tag chips (Agenda/Humor):** the domain tint at full saturation as text on its 13–20% tint fill, 7px radius.

### Cards and Containers
- **Corner Style:** 18px (`rounded.lg`) standard list/section cards; 24px (`rounded.xl`) hero cards and bottom sheets; 12–14px inline tiles.
- **Background:** Surface White on Sage Canvas, 1px Border Mist border, no resting shadow.
- **Icon tiles:** 40–46px rounded squares (12–14px radius) filled with a domain tint (teal/amber/pink light) holding a line icon or a user emoji. The recurring unit in every list row.
- **Hero (gradient) cards:** dark gradient (`#163A2E → #0E1A16`) or domain gradient (amber/teal goal cards), white text, hero-raise shadow. Reserved for Foco agora, the goals donut, and goal cards.

### Inputs and Fields
- **Style:** Sage Canvas fill (the field recedes into the surface), 1px Border Mist border, 12px radius, Forest Ink text.
- **Focus:** Border shifts to Growth Green.
- **Error:** Border shifts to Coral; a specific plain-language message sits below ("Use o formato AAAA-MM-DD, ex: 2025-06-30").
- **Disabled:** 40% opacity on the field.

### Navigation (Bottom Tab Bar)
- **Style:** A custom animated bar. Five tabs (Agenda, Metas, Início, Cuidados, Perfil). The active tab's icon rides in a Growth Green circular "bubble" that slides between positions; an SVG notch cuts the bar's top edge to cradle it.
- **Icons:** Lucide line icons (calendar, target, home, heart-pulse, smile), not emoji. Inactive icons are Text Muted; the active icon is white inside the bubble.
- **Labels:** 10–11px, shown under inactive tabs. (Known gap: the active tab currently hides its label; restoring it is a documented fix.)

### Signature Components
- **The XP Header.** The green gradient header holds a translucent level card: a Spring Green rounded-square level badge (#17E375, Forest Ink number), the tree-themed level name, the XP fraction, and a 9px progress bar whose fill is the Spring Green → Mint gradient. The single most-loaded moment of positive reinforcement; its color must stay precise.
- **The Foco Card.** A dark gradient card surfacing the one next action: tinted icon tile, title, tag·meta, a Spring Green "+XP" chip, and a full-width Spring Green "Concluir agora" button. The literal expression of "one clear next step."
- **The Goals Donut.** An SVG ring (Spring Green stroke on a translucent track) on a dark gradient card, percentage centered, with an encouraging companion line.
- **The Timeline (Agenda).** A vertical rail of dots and connectors; each event is a tinted-chip card, the current one ringed Spring Green and badged "Agora".

## 6. Do's and Don'ts

### Do:
- **Do** use Sage Canvas (#F4F7F4) as the screen background, green-tinted toward the brand. Never a warmer or more neutral tint.
- **Do** keep Growth Green (#0F6E56) as the one brand-and-action color; make every green element genuinely interactive, branded, or achieved.
- **Do** carry territory with the warm accents now that green is the brand: amber for reward/streaks, pink for mood, the dark tile for deep-focus/hero, coral for danger.
- **Do** keep Text Secondary (#5C6A62) and Text Muted (#647067) as the floors for any text; verify ≥4.5:1 before shipping. "Muted gray on near-white is not acceptable."
- **Do** keep one dominant action per screen — ADHD users need a single clear next step, not a choice menu. The Foco card is the model.
- **Do** reserve real shadow and gradient for the three hero moments (headers, hero cards, FAB); keep ordinary cards flat with a 1px border.
- **Do** pair primary and secondary buttons in modal rows: secondary (outline) left, primary (filled) right, equal width.
- **Do** use line icons for UI chrome and reserve emoji for user-chosen habit/mood expression.
- **Do** write companion-toned copy for every empty, error, and past-due state — always with the user, never evaluating them.

### Don't:
- **Don't** use warm-tinted backgrounds (cream, sand, paper, linen, ivory, parchment). The canvas is Sage Canvas, green-tinted. Warm neutrals are the AI default; Sidekick is not that.
- **Don't** use clinical or cold palettes — no hospital-white sterility, no corporate blue-gray, no cold neutral surfaces. Sidekick is about wellbeing, not diagnosis.
- **Don't** ship Duolingo-style shrieking colors, bouncy mascots, or children's-app aesthetics. Gamification must feel mature and earned.
- **Don't** design to Jira or Monday energy — dense grids, corporate blues, zero personality.
- **Don't** create ultra-minimalist no-color checklist aesthetics. Empty states need copy and care, not a lone sad icon.
- **Don't** shame users for incomplete tasks. Past-due items are opportunities, not failures. Red-alert shaming is off-brand.
- **Don't** put words in Decor Ash (#A2ABA4) or Decor Ash Faint (#B4BDB5); those are non-text tints only.
- **Don't** add a shadow to a resting list card, input, or tile. Elevation belongs to the three hero moments only.
- **Don't** apply `border-left` colored stripes as accents on cards or list items. Use full borders, background tints, or leading icon tiles.
- **Don't** use gradient text (`background-clip: text` with a gradient fill). Gradients live on card surfaces and progress bars, never on type.
- **Don't** use a tracked all-caps eyebrow above every section. It is reserved for the Foco label and the Agenda weekday.
