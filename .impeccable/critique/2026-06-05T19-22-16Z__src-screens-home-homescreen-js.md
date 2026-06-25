---
target: Home
total_score: 19
p0_count: 0
p1_count: 3
timestamp: 2026-06-05T19-22-16Z
slug: src-screens-home-homescreen-js
---
## Design Health Score
Total: 19/40 - Poor

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No animation on task completion; no save confirmations |
| 2 | Match System / Real World | 3 | "Home" tab English; chevron implies navigation but does completion |
| 3 | User Control and Freedom | 2 | No undo; long-press for edit/delete undiscoverable |
| 4 | Consistency and Standards | 2 | Chevron misleads; side-stripe only on overdue; tab inconsistency |
| 5 | Error Prevention | 2 | Deadline raw text AAAA-MM-DD, no validation |
| 6 | Recognition Rather Than Recall | 2 | Long-press invisible; emoji tabs unlabeled |
| 7 | Flexibility and Efficiency | 2 | Presets good; no swipe or batch |
| 8 | Aesthetic and Minimalist Design | 2 | Hero + calendar + stats + tasks compete above fold |
| 9 | Error Recovery | 1 | Invalid deadline silently accepted |
| 10 | Help and Documentation | 1 | No help; FAB not presented as AI; no onboarding |

## Anti-Patterns Verdict
Two absolute ban violations: side-stripe border on listaCardAtrasada (borderLeftWidth:3); all-caps tracked eyebrows on every stat card. Detector returned 0 (React Native StyleSheet outside its scope).

## Priority Issues

[P1] Side-stripe border on overdue cards - absolute ban
Fix: Replace with coralLight background tint on container + rgba tint on rows.

[P1] textMuted #888780 fails WCAG AA contrast (3.3:1 on white) at 10-11px
Fix: Use textSecondary #6B6B8A (~5:1) for all secondary body text.

[P1] Chevron implies navigation but completes task - affordance mismatch
Fix: Replace with circle checkbox component.

[P2] All-caps eyebrows on every stat card - reflexive AI pattern
Fix: Drop or use sentence-case. Let numbers speak through position.

[P2] Deadline raw text input AAAA-MM-DD with no validation
Fix: DateTimePicker or format mask with onBlur validation.

## Persona Red Flags
Mariana (ADHD): Two competing CTAs; accidental completions with no undo; no modal draft save.
Casey (Mobile): Nova button not in thumb zone; FAB missing insets.bottom; task creation too long.
Jordan (First-Timer): XP/streak system unexplained; edit/delete invisible; no recovery path.

## Minor Observations
- cardStreak hardcoded 155px width
- Weekly calendar decoration only - interactive or remove
- fabChat missing insets.bottom
- Concluidas on home screen adds noise
- Tab labels use route.name directly - "Home" is English
