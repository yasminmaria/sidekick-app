// Maps free-form Portuguese task/habit titles to a lucide icon name and a
// colored tint, so the redesigned tiles look intentional without requiring
// the user to pick an icon per item.

const KEYWORD_ICONS = [
  [/rem[eé]dio|ritalina|sertralina|comprimid|p[ií]lula|dose|medic/i, 'pill'],
  [/[aá]gua|beber|hidrat/i, 'droplet'],
  [/medita|respir|calm|mindful/i, 'wind'],
  [/exerc|corr|caminh|academia|treino|passear|cachorro|atividade/i, 'activity'],
  [/estud|ler|leitura|livro|curso|react/i, 'book'],
  [/consulta|m[eé]dic|neuro|sa[uú]de|terapia|dentista/i, 'heartPulse'],
  [/reuni|trabalho|projeto|call|compromisso/i, 'calendar'],
  [/dormir|sono|noite/i, 'moon'],
  [/comer|refei|almo|jantar|caf[eé]/i, 'sprout'],
]

const TINT_CYCLE = ['teal', 'amber', 'pink', 'dark']

export function iconForTitulo(titulo = '') {
  for (const [re, icon] of KEYWORD_ICONS) {
    if (re.test(titulo)) return icon
  }
  return 'sparkle'
}

// Deterministic tint from a string id, so a given item keeps its color.
export function tintForId(id = '') {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return TINT_CYCLE[h % 3] // skip 'dark' for tile backgrounds by default
}

export function tintForIndex(i) {
  return TINT_CYCLE[i % 3]
}

// Tree-themed level names (the brand grows a forest as you level up).
const NIVEL_NOMES = [
  'Semente',
  'Broto',
  'Muda',
  'Arbusto',
  'Árvore jovem',
  'Árvore',
  'Árvore madura',
  'Floresta densa',
  'Bosque',
  'Mata viva',
]

export function nivelNome(nivel = 1) {
  const i = Math.min(Math.max(nivel - 1, 0), NIVEL_NOMES.length - 1)
  return NIVEL_NOMES[i]
}

export function proximoNivelNome(nivel = 1) {
  const i = Math.min(nivel, NIVEL_NOMES.length - 1)
  return NIVEL_NOMES[i]
}
