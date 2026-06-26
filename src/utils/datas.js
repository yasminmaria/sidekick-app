// Data no formato YYYY-MM-DD usando o fuso LOCAL do aparelho.
// IMPORTANTE: nunca use `new Date().toISOString().split('T')[0]` para "hoje" —
// isso devolve a data em UTC, então em fusos a oeste (ex.: Brasil UTC-3) o "dia"
// vira antes da meia-noite local e quebra o reset diário e os filtros de "hoje".
export function dataLocal(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
