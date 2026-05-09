import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TextInput, Switch, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { colors, spacing, radii, typography } from '../../theme'
import { Header } from '../../components/ui/Header'
import PerfilScreen from '../Perfil/PerfilScreen'
import { useNavigation } from '@react-navigation/native'


const TIPOS = [
  { valor: 'comprimido', label: '💊 Comprimido' },
  { valor: 'capsula', label: '💉 Cápsula' },
  { valor: 'liquido', label: '🧪 Líquido' },
  { valor: 'topico', label: '🧴 Tópico' },
]

const FREQUENCIAS_MED = [
  { valor: 'diaria', label: '📅 Diária' },
  { valor: 'semanal', label: '📆 Semanal' },
  { valor: 'quando_necessario', label: '⚡ Quando necessário' },
]

const DIAS_SEMANA = [
  { valor: 'dom', label: 'D' },
  { valor: 'seg', label: 'S' },
  { valor: 'ter', label: 'T' },
  { valor: 'qua', label: 'Q' },
  { valor: 'qui', label: 'Q' },
  { valor: 'sex', label: 'S' },
  { valor: 'sab', label: 'S' },
]

const HORARIOS_SUGERIDOS = ['06:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00']

function estadoInicialMed() {
  return {
    nome: '', tipo: 'comprimido', dosagem: '', frequencia: 'diaria',
    dias: ['seg', 'ter', 'qua', 'qui', 'sex'], horarios: ['08:00'],
    duracao: 'continuo', dataInicio: new Date().toISOString().split('T')[0],
    dataTermino: null, quantidade: '30', avisarReposicao: true, quantidadeAviso: '10',
  }
}

export default function CuidadosScreen() {
  const {
    habitos,
    adicionarHabito,
    concluirHabito,
    incrementarHabito,
    medicamentos,
    adicionarMedicamento,
    editarMedicamento,
    deletarMedicamento,
    registrarDose
  } = useAppStore()

  const [abaAtiva, setAbaAtiva] = useState('habitos')
  const [modalHabito, setModalHabito] = useState(false)
  const [modalMedicamento, setModalMedicamento] = useState(false)
  const [novoHabito, setNovoHabito] = useState({
    titulo: '',
    emoji: '⭐',
    tipo: 'simples',
    meta: '8',
    unidade: 'vezes',
  })
  const [novoMed, setNovoMed] = useState(estadoInicialMed())
  const [medEditando, setMedEditando] = useState(null)
  const [novoHorario, setNovoHorario] = useState('')
  const [perfilVisivel, setPerfilVisivel] = useState(false)
  const [chatVisivel, setChatVisivel] = useState(false)
  const habitosFeitos = habitos.filter(h => h.concluidoHoje).length

  function salvarHabito() {
    if (!novoHabito.titulo.trim()) return
    adicionarHabito({
      titulo: novoHabito.titulo,
      emoji: novoHabito.emoji,
      tipo: novoHabito.tipo,
      meta: novoHabito.tipo === 'contador' ? parseInt(novoHabito.meta) || 1 : null,
      unidade: novoHabito.tipo === 'contador' ? novoHabito.unidade : null,
    })
    setNovoHabito({ titulo: '', emoji: '⭐', tipo: 'simples', meta: '8', unidade: 'vezes' })
    setModalHabito(false)
  }

  function abrirEditarMed(med) {
    setMedEditando(med)
    setNovoMed({
      nome: med.nome, tipo: med.tipo, dosagem: med.dosagem,
      frequencia: med.frequencia, dias: med.dias || [],
      horarios: med.horarios || [], duracao: med.duracao,
      dataInicio: med.dataInicio, dataTermino: med.dataTermino,
      quantidade: String(med.quantidade), avisarReposicao: med.avisarReposicao,
      quantidadeAviso: String(med.quantidadeAviso),
    })
    setModalMedicamento(true)
  }

  function onLongPressMed(med) {
    Alert.alert(med.nome, 'O que deseja fazer?', [
      { text: 'Editar', onPress: () => abrirEditarMed(med) },
      {
        text: 'Deletar', style: 'destructive', onPress: () =>
          Alert.alert('Deletar medicamento?', `"${med.nome}" será removido.`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Deletar', style: 'destructive', onPress: () => deletarMedicamento(med.id) },
          ])
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  function salvarMedicamento() {
    if (!novoMed.nome.trim()) return
    const dados = {
      ...novoMed,
      quantidade: parseInt(novoMed.quantidade) || 30,
      quantidadeAviso: parseInt(novoMed.quantidadeAviso) || 10,
      dataTermino: novoMed.duracao === 'continuo' ? null : novoMed.dataTermino,
    }
    if (medEditando) {
      editarMedicamento(medEditando.id, dados)
      setMedEditando(null)
    } else {
      adicionarMedicamento(dados)
    }
    setNovoMed(estadoInicialMed())
    setModalMedicamento(false)
  }

  function toggleDiaMed(dia) {
    const jaSelecionado = novoMed.dias.includes(dia)
    setNovoMed({ ...novoMed, dias: jaSelecionado ? novoMed.dias.filter(d => d !== dia) : [...novoMed.dias, dia] })
  }

  function toggleHorario(horario) {
    const jaSelecionado = novoMed.horarios.includes(horario)
    setNovoMed({ ...novoMed, horarios: jaSelecionado ? novoMed.horarios.filter(h => h !== horario) : [...novoMed.horarios, horario].sort() })
  }

  function adicionarHorarioCustom() {
    if (!novoHorario.match(/^\d{2}:\d{2}$/)) return
    if (novoMed.horarios.includes(novoHorario)) return
    setNovoMed({ ...novoMed, horarios: [...novoMed.horarios, novoHorario].sort() })
    setNovoHorario('')
  }

  function porcentagemEstoque(med) {
    if (!med.quantidade) return 0
    const max = parseInt(med.quantidade) + (med.tomadosHoje?.length || 0)
    return Math.min(Math.round((med.quantidade / max) * 100), 100)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER GLOBAL */}
                     <Header onAvatarPress={() => setPerfilVisivel(true)} />
               
                     <Modal
                       visible={perfilVisivel}
                       animationType="slide"
                       onRequestClose={() => setPerfilVisivel(false)}
                     >
                       <PerfilScreen onFechar={() => setPerfilVisivel(false)} />
                     </Modal>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Cuidados</Text>

        <View style={styles.abas}>
          <TouchableOpacity style={[styles.aba, abaAtiva === 'habitos' && styles.abaAtiva]} onPress={() => setAbaAtiva('habitos')}>
            <Text style={[styles.abaTexto, abaAtiva === 'habitos' && styles.abaTextoAtivo]}>🌱 Hábitos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.aba, abaAtiva === 'medicamentos' && styles.abaAtiva]} onPress={() => setAbaAtiva('medicamentos')}>
            <Text style={[styles.abaTexto, abaAtiva === 'medicamentos' && styles.abaTextoAtivo]}>💊 Medicamentos</Text>
          </TouchableOpacity>
        </View>

        {abaAtiva === 'habitos' && (
          <View>
            {/* RESUMO */}
            <View style={styles.resumoCard}>
              <Text style={styles.resumoTitulo}>Progresso de hoje</Text>
              <View style={styles.resumoRow}>
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoValor}>{habitosFeitos}</Text>
                  <Text style={styles.resumoLabel}>feitos</Text>
                </View>
                <View style={styles.resumoDivisor} />
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoValor}>{habitos.length - habitosFeitos}</Text>
                  <Text style={styles.resumoLabel}>pendentes</Text>
                </View>
                <View style={styles.resumoDivisor} />
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoValor}>{habitos.length > 0 ? Math.max(...habitos.map(h => h.streak)) : 0}</Text>
                  <Text style={styles.resumoLabel}>🔥 streak</Text>
                </View>
              </View>
              {habitos.length > 0 && (
                <View style={styles.progressoFundo}>
                  <View style={[styles.progressoPreenchido, { width: `${Math.round((habitosFeitos / habitos.length) * 100)}%` }]} />
                </View>
              )}
            </View>

            <View style={styles.secaoHeader}>
              <Text style={styles.secaoTitulo}>Hábitos diários</Text>
              <TouchableOpacity style={styles.botaoAdicionar} onPress={() => setModalHabito(true)}>
                <Text style={styles.botaoAdicionarTexto}>+ Novo</Text>
              </TouchableOpacity>
            </View>

            {habitos.length === 0 ? (
              <View style={styles.vazio}>
                <Text style={styles.vazioTexto}>Nenhum hábito ainda</Text>
                <Text style={styles.vazioDica}>Crie hábitos para acompanhar seu dia</Text>
              </View>
            ) : (
              habitos.map(habito => {
                // ... código dos cards que você já tem
              })
            )}
          </View>
        )}
        {abaAtiva === 'habitos' && habitos.map(habito => {
          const ehContador = habito.tipo === 'contador'
          const porcentagem = ehContador && habito.meta
            ? Math.min(Math.round((habito.progresso / habito.meta) * 100), 100)
            : 0

          return (
            <View
              key={habito.id}
              style={[styles.cardHabito, habito.concluidoHoje && styles.cardHabitoConcluido]}
            >
              <View style={styles.habitoEmoji}>
                <Text style={styles.habitoEmojiTexto}>{habito.emoji}</Text>
              </View>

              <View style={styles.habitoInfo}>
                <Text style={[styles.habitoTitulo, habito.concluidoHoje && styles.habitoConcluido]}>
                  {habito.titulo}
                </Text>

                {ehContador ? (
                  <View>
                    <Text style={styles.habitoStreak}>
                      {habito.progresso}/{habito.meta} {habito.unidade} · 🔥 {habito.streak} dias
                    </Text>
                    {/* Barra de progresso */}
                    <View style={styles.habitoBarraFundo}>
                      <View style={[
                        styles.habitoBarraPreenchida,
                        { width: `${porcentagem}%` },
                        habito.concluidoHoje && { backgroundColor: colors.success }
                      ]} />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.habitoStreak}>🔥 {habito.streak} dias seguidos</Text>
                )}
              </View>

              {/* Ações */}
              {ehContador ? (
                <View style={styles.contadorAcoes}>
                  <TouchableOpacity
                    style={[styles.contadorBtn, habito.concluidoHoje && styles.contadorBtnDesabilitado]}
                    onPress={() => !habito.concluidoHoje && incrementarHabito(habito.id, -1)}
                  >
                    <Text style={styles.contadorBtnTexto}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.contadorValor}>{habito.progresso}</Text>
                  <TouchableOpacity
                    style={[styles.contadorBtn, styles.contadorBtnPlus, habito.concluidoHoje && styles.contadorBtnDesabilitado]}
                    onPress={() => !habito.concluidoHoje && incrementarHabito(habito.id, 1)}
                  >
                    <Text style={[styles.contadorBtnTexto, { color: 'white' }]}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.habitoCheck, habito.concluidoHoje && styles.habitoCheckFeito]}
                  onPress={() => concluirHabito(habito.id)}
                >
                  {habito.concluidoHoje
                    ? <Text style={styles.checkmark}>✓</Text>
                    : <Text style={styles.checkmarkVazio}>○</Text>
                  }
                </TouchableOpacity>
              )}
            </View>
          )
        })
        }


        {abaAtiva === 'medicamentos' && (
          <View>
            <View style={styles.secaoHeader}>
              <Text style={styles.secaoTitulo}>Meus medicamentos</Text>
              <TouchableOpacity style={styles.botaoAdicionar} onPress={() => { setMedEditando(null); setNovoMed(estadoInicialMed()); setModalMedicamento(true) }}>
                <Text style={styles.botaoAdicionarTexto}>+ Novo</Text>
              </TouchableOpacity>
            </View>

            {medicamentos.length === 0 ? (
              <View style={styles.vazio}>
                <Text style={styles.vazioTexto}>Nenhum medicamento ainda</Text>
                <Text style={styles.vazioDica}>Toque em + Novo para adicionar</Text>
              </View>
            ) : (
              medicamentos.map(med => {
                const estoqueBaixo = med.avisarReposicao && med.quantidade <= med.quantidadeAviso
                return (
                  <TouchableOpacity key={med.id} style={[styles.cardMed, estoqueBaixo && styles.cardMedAviso]} onLongPress={() => onLongPressMed(med)} delayLongPress={400} activeOpacity={1}>
                    <View style={styles.cardMedHeader}>
                      <View style={styles.cardMedInfo}>
                        <Text style={styles.cardMedNome}>{med.nome}</Text>
                        <Text style={styles.cardMedDetalhe}>{TIPOS.find(t => t.valor === med.tipo)?.label.split(' ')[0]} · {med.dosagem}</Text>
                      </View>
                      <View style={styles.estoqueInfo}>
                        <Text style={[styles.estoqueNumero, estoqueBaixo && { color: colors.coral }]}>{med.quantidade}</Text>
                        <Text style={styles.estoqueLegenda}>restam</Text>
                      </View>
                    </View>

                    {estoqueBaixo && (
                      <View style={styles.avisoEstoque}>
                        <Text style={styles.avisoEstoqueTexto}>⚠️ Estoque baixo — hora de repor!</Text>
                      </View>
                    )}

                    <Text style={styles.horariosLabel}>Horários de hoje</Text>
                    <View style={styles.horariosRow}>
                      {(med.horarios || []).map(horario => {
                        const tomado = (med.tomadosHoje || []).includes(horario)
                        return (
                          <TouchableOpacity key={horario} style={[styles.horarioBtn, tomado && styles.horarioBtnTomado]} onPress={() => registrarDose(med.id, horario)}>
                            <Text style={[styles.horarioBtnTexto, tomado && styles.horarioBtnTextoTomado]}>{tomado ? '✓ ' : ''}{horario}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>

                    <View style={styles.estoqueBarraFundo}>
                      <View style={[styles.estoqueBarraPreenchida, { width: `${porcentagemEstoque(med)}%` }, estoqueBaixo && { backgroundColor: colors.coral }]} />
                    </View>
                  </TouchableOpacity>
                )
              })
            )}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.fab, abaAtiva === 'medicamentos' && { backgroundColor: colors.teal }]} onPress={() => abaAtiva === 'habitos' ? setModalHabito(true) : setModalMedicamento(true)}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalHabito} transparent animationType="slide" onRequestClose={() => setModalHabito(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalFundo}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitulo}>Novo hábito</Text>

                {/* EMOJI */}
                <Text style={styles.inputLabel}>Emoji</Text>
                <View style={styles.emojiRow}>
                  {['💧', '🏃', '🧘', '📚', '🥗', '😴', '💊', '✍️', '🏋️', '🚴'].map(e => (
                    <TouchableOpacity
                      key={e}
                      style={[styles.emojiOpcao, novoHabito.emoji === e && styles.emojiSelecionado]}
                      onPress={() => setNovoHabito({ ...novoHabito, emoji: e })}
                    >
                      <Text style={{ fontSize: 22 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* NOME */}
                <Text style={styles.inputLabel}>Nome do hábito</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Beber água"
                  placeholderTextColor={colors.textMuted}
                  value={novoHabito.titulo}
                  onChangeText={t => setNovoHabito({ ...novoHabito, titulo: t })}
                  autoFocus
                />

                {/* TIPO */}
                <Text style={styles.inputLabel}>Tipo</Text>
                <View style={styles.tipoHabitoRow}>
                  <TouchableOpacity
                    style={[styles.tipoHabitoOpcao, novoHabito.tipo === 'simples' && styles.tipoHabitoAtivo]}
                    onPress={() => setNovoHabito({ ...novoHabito, tipo: 'simples' })}
                  >
                    <Text style={styles.tipoHabitoIcone}>✅</Text>
                    <Text style={[styles.tipoHabitoTexto, novoHabito.tipo === 'simples' && styles.tipoHabitoTextoAtivo]}>
                      Simples
                    </Text>
                    <Text style={styles.tipoHabitoDesc}>Feito ou não feito</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tipoHabitoOpcao, novoHabito.tipo === 'contador' && styles.tipoHabitoAtivo]}
                    onPress={() => setNovoHabito({ ...novoHabito, tipo: 'contador' })}
                  >
                    <Text style={styles.tipoHabitoIcone}>🔢</Text>
                    <Text style={[styles.tipoHabitoTexto, novoHabito.tipo === 'contador' && styles.tipoHabitoTextoAtivo]}>
                      Contador
                    </Text>
                    <Text style={styles.tipoHabitoDesc}>Acompanha quantidade</Text>
                  </TouchableOpacity>
                </View>

                {/* CAMPOS DO CONTADOR */}
                {novoHabito.tipo === 'contador' && (
                  <View style={styles.contadorCampos}>
                    <View style={styles.contadorRow}>
                      <View style={styles.contadorCampo}>
                        <Text style={styles.inputLabel}>Meta diária</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          placeholder="Ex: 8"
                          placeholderTextColor={colors.textMuted}
                          value={novoHabito.meta}
                          onChangeText={t => setNovoHabito({ ...novoHabito, meta: t })}
                        />
                      </View>
                      <View style={styles.contadorCampo}>
                        <Text style={styles.inputLabel}>Unidade</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Ex: copos, km, h"
                          placeholderTextColor={colors.textMuted}
                          value={novoHabito.unidade}
                          onChangeText={t => setNovoHabito({ ...novoHabito, unidade: t })}
                        />
                      </View>
                    </View>

                    {/* Sugestões de unidade */}
                    <View style={styles.unidadesSugeridas}>
                      {['copos', 'km', 'min', 'horas', 'páginas', 'vezes'].map(u => (
                        <TouchableOpacity
                          key={u}
                          style={[styles.unidadePilula, novoHabito.unidade === u && styles.unidadePilulaAtiva]}
                          onPress={() => setNovoHabito({ ...novoHabito, unidade: u })}
                        >
                          <Text style={[styles.unidadeTexto, novoHabito.unidade === u && styles.unidadeTextoAtivo]}>
                            {u}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.modalBotoes}>
                  <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalHabito(false)}>
                    <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.botaoSalvar} onPress={salvarHabito}>
                    <Text style={styles.botaoSalvarTexto}>Criar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={modalMedicamento} transparent animationType="slide" onRequestClose={() => setModalMedicamento(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalFundo}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitulo}>{medEditando ? 'Editar medicamento' : 'Novo medicamento'}</Text>

                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput style={styles.input} placeholder="Ex: Ritalina, Venvanse..." placeholderTextColor={colors.textMuted} value={novoMed.nome} onChangeText={t => setNovoMed({ ...novoMed, nome: t })} autoFocus />

                <Text style={styles.inputLabel}>Tipo</Text>
                <View style={styles.tipoRow}>
                  {TIPOS.map(t => (
                    <TouchableOpacity key={t.valor} style={[styles.tipoOpcao, novoMed.tipo === t.valor && styles.tipoAtivo]} onPress={() => setNovoMed({ ...novoMed, tipo: t.valor })}>
                      <Text style={[styles.tipoTexto, novoMed.tipo === t.valor && styles.tipoTextoAtivo]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Dosagem</Text>
                <TextInput style={styles.input} placeholder="Ex: 18mg, 10ml" placeholderTextColor={colors.textMuted} value={novoMed.dosagem} onChangeText={t => setNovoMed({ ...novoMed, dosagem: t })} />

                <Text style={styles.inputLabel}>Frequência</Text>
                <View style={styles.frequenciaRow}>
                  {FREQUENCIAS_MED.map(f => (
                    <TouchableOpacity key={f.valor} style={[styles.frequenciaOpcao, novoMed.frequencia === f.valor && styles.frequenciaAtiva]} onPress={() => setNovoMed({ ...novoMed, frequencia: f.valor })}>
                      <Text style={[styles.frequenciaTexto, novoMed.frequencia === f.valor && styles.frequenciaTextoAtivo]}>{f.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {novoMed.frequencia === 'semanal' && (
                  <View style={styles.diasContainer}>
                    <Text style={styles.inputLabel}>Dias da semana</Text>
                    <View style={styles.diasRow}>
                      {DIAS_SEMANA.map(dia => {
                        const selecionado = novoMed.dias.includes(dia.valor)
                        return (
                          <TouchableOpacity key={dia.valor} style={[styles.diaBtn, selecionado && styles.diaBtnAtivo]} onPress={() => toggleDiaMed(dia.valor)}>
                            <Text style={[styles.diaBtnTexto, selecionado && styles.diaBtnTextoAtivo]}>{dia.label}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </View>
                )}

                {novoMed.frequencia !== 'quando_necessario' && (
                  <View>
                    <Text style={styles.inputLabel}>Horários</Text>
                    <View style={styles.horariosSugeridos}>
                      {HORARIOS_SUGERIDOS.map(h => {
                        const selecionado = novoMed.horarios.includes(h)
                        return (
                          <TouchableOpacity key={h} style={[styles.horarioSugerido, selecionado && styles.horarioSugeridoAtivo]} onPress={() => toggleHorario(h)}>
                            <Text style={[styles.horarioSugeridoTexto, selecionado && styles.horarioSugeridoTextoAtivo]}>{h}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                    <View style={styles.horarioCustomRow}>
                      <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Outro horário (ex: 07:30)" placeholderTextColor={colors.textMuted} value={novoHorario} onChangeText={setNovoHorario} keyboardType="numeric" />
                      <TouchableOpacity style={styles.horarioCustomBtn} onPress={adicionarHorarioCustom}>
                        <Text style={styles.horarioCustomBtnTexto}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <Text style={styles.inputLabel}>Duração do tratamento</Text>
                <View style={styles.duracaoRow}>
                  {[{ valor: 'continuo', label: '♾️ Uso contínuo' }, { valor: 'com_termino', label: '📅 Com término' }].map(d => (
                    <TouchableOpacity key={d.valor} style={[styles.duracaoOpcao, novoMed.duracao === d.valor && styles.duracaoAtiva]} onPress={() => setNovoMed({ ...novoMed, duracao: d.valor })}>
                      <Text style={[styles.duracaoTexto, novoMed.duracao === d.valor && styles.duracaoTextoAtivo]}>{d.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {novoMed.duracao === 'com_termino' && (
                  <View>
                    <Text style={styles.inputLabel}>Data de término</Text>
                    <TextInput style={styles.input} placeholder="AAAA-MM-DD" placeholderTextColor={colors.textMuted} value={novoMed.dataTermino || ''} onChangeText={t => setNovoMed({ ...novoMed, dataTermino: t })} />
                  </View>
                )}

                <Text style={styles.inputLabel}>Quantidade em estoque</Text>
                <TextInput style={styles.input} placeholder="Ex: 30" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={novoMed.quantidade} onChangeText={t => setNovoMed({ ...novoMed, quantidade: t })} />

                <View style={styles.toggleRow}>
                  <View>
                    <Text style={styles.toggleLabel}>Avisar reposição</Text>
                    <Text style={styles.toggleDesc}>Alerta quando o estoque estiver baixo</Text>
                  </View>
                  <Switch value={novoMed.avisarReposicao} onValueChange={v => setNovoMed({ ...novoMed, avisarReposicao: v })} trackColor={{ false: colors.border, true: colors.teal }} thumbColor="white" />
                </View>

                {novoMed.avisarReposicao && (
                  <View>
                    <Text style={styles.inputLabel}>Avisar quando restar</Text>
                    <TextInput style={styles.input} placeholder="Ex: 10" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={novoMed.quantidadeAviso} onChangeText={t => setNovoMed({ ...novoMed, quantidadeAviso: t })} />
                  </View>
                )}

                <View style={styles.modalBotoes}>
                  <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalMedicamento(false)}>
                    <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.botaoSalvar, { backgroundColor: colors.teal }, !novoMed.nome.trim() && styles.botaoSalvarDesabilitado]} onPress={salvarMedicamento}>
                    <Text style={styles.botaoSalvarTexto}>{medEditando ? 'Salvar alterações' : 'Salvar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  saudacao: { ...typography.h2 },
  data: { ...typography.caption, marginTop: 2, textTransform: 'capitalize' },
  avatar: { width: 44, height: 44, borderRadius: radii.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontSize: 15, fontWeight: '600', color: colors.primaryDark },

  scroll: { paddingBottom: 100 },
  titulo: { ...typography.h2, padding: spacing.md, paddingBottom: spacing.sm },
  abas: { flexDirection: 'row', marginHorizontal: spacing.md, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radii.lg, padding: 4, borderWidth: 1, borderColor: colors.border },
  aba: { flex: 1, padding: spacing.sm, borderRadius: radii.md, alignItems: 'center' },
  abaAtiva: { backgroundColor: colors.primary },
  abaTexto: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  abaTextoAtivo: { color: 'white' },
  resumoCard: { backgroundColor: colors.primaryLight, borderRadius: radii.lg, margin: spacing.md, padding: spacing.md },
  resumoTitulo: { ...typography.label, color: colors.primaryDark, marginBottom: spacing.md },
  resumoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  resumoItem: { flex: 1, alignItems: 'center' },
  resumoValor: { fontSize: 28, fontWeight: '700', color: colors.primaryDark },
  resumoLabel: { ...typography.caption, color: colors.primaryDark, opacity: 0.7, textAlign: 'center' },
  resumoDivisor: { width: 1, height: 40, backgroundColor: colors.primary, opacity: 0.2 },
  progressoFundo: { height: 8, backgroundColor: colors.primary, opacity: 0.2, borderRadius: radii.full, overflow: 'hidden' },
  progressoPreenchido: { height: 8, backgroundColor: colors.primaryDark, borderRadius: radii.full },
  secaoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  secaoTitulo: { ...typography.h3 },
  botaoAdicionar: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full },
  botaoAdicionarTexto: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
  cardHabito: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, marginHorizontal: spacing.md, marginBottom: spacing.sm, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardHabitoConcluido: { backgroundColor: colors.background, opacity: 0.7 },
  habitoEmoji: { width: 44, height: 44, borderRadius: radii.md, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  habitoEmojiTexto: { fontSize: 24 },
  habitoInfo: { flex: 1 },
  habitoTitulo: { ...typography.body, fontWeight: '600' },
  habitoConcluido: { textDecorationLine: 'line-through', color: colors.textMuted },
  habitoStreak: { ...typography.caption, marginTop: 2 },
  habitoCheck: { width: 30, height: 30, borderRadius: radii.full, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  habitoCheckFeito: { backgroundColor: colors.success, borderColor: colors.success },
  // Tipo de hábito
  tipoHabitoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tipoHabitoOpcao: { flex: 1, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: spacing.xs },
  tipoHabitoAtivo: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  tipoHabitoIcone: { fontSize: 24 },
  tipoHabitoTexto: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tipoHabitoTextoAtivo: { color: colors.primaryDark },
  tipoHabitoDesc: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },

  // Campos do contador
  contadorCampos: { marginBottom: spacing.sm },
  contadorRow: { flexDirection: 'row', gap: spacing.sm },
  contadorCampo: { flex: 1 },
  unidadesSugeridas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  unidadePilula: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border },
  unidadePilulaAtiva: { backgroundColor: colors.primary, borderColor: colors.primary },
  unidadeTexto: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  unidadeTextoAtivo: { color: 'white' },

  // Card contador
  habitoBarraFundo: { height: 4, backgroundColor: colors.border, borderRadius: radii.full, overflow: 'hidden', marginTop: 4 },
  habitoBarraPreenchida: { height: 4, backgroundColor: colors.primary, borderRadius: radii.full },
  contadorAcoes: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  contadorBtn: { width: 32, height: 32, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  contadorBtnPlus: { backgroundColor: colors.primary, borderColor: colors.primary },
  contadorBtnDesabilitado: { opacity: 0.3 },
  contadorBtnTexto: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, lineHeight: 22 },
  contadorValor: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, minWidth: 24, textAlign: 'center' },
  checkmark: { color: 'white', fontSize: 16, fontWeight: '700' },
  checkmarkVazio: { color: colors.textMuted, fontSize: 16 },
  cardMed: { backgroundColor: colors.surface, borderRadius: radii.lg, marginHorizontal: spacing.md, marginBottom: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardMedAviso: { borderColor: colors.coral, borderWidth: 1.5 },
  cardMedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardMedInfo: { flex: 1 },
  cardMedNome: { ...typography.h3 },
  cardMedDetalhe: { ...typography.caption, marginTop: 2 },
  estoqueInfo: { alignItems: 'center', minWidth: 50 },
  estoqueNumero: { fontSize: 24, fontWeight: '700', color: colors.teal },
  estoqueLegenda: { ...typography.caption },
  avisoEstoque: { backgroundColor: colors.coralLight, borderRadius: radii.sm, padding: spacing.sm, marginBottom: spacing.sm },
  avisoEstoqueTexto: { fontSize: 12, color: colors.coral, fontWeight: '500' },
  horariosLabel: { ...typography.label, marginBottom: spacing.xs },
  horariosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  horarioBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  horarioBtnTomado: { backgroundColor: colors.teal, borderColor: colors.teal },
  horarioBtnTexto: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  horarioBtnTextoTomado: { color: 'white' },
  estoqueBarraFundo: { height: 6, backgroundColor: colors.border, borderRadius: radii.full, overflow: 'hidden', marginTop: spacing.xs },
  estoqueBarraPreenchida: { height: 6, backgroundColor: colors.teal, borderRadius: radii.full },
  vazio: { alignItems: 'center', paddingVertical: spacing.xl },
  vazioTexto: { ...typography.body, color: colors.textMuted },
  vazioDica: { ...typography.caption, marginTop: spacing.xs },
  fab: { position: 'absolute', bottom: 20, right: spacing.lg, width: 52, height: 52, borderRadius: radii.full, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabTexto: { color: 'white', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalScroll: { justifyContent: 'flex-end', flexGrow: 1 },
  modalContainer: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.lg, paddingBottom: spacing.xxl },
  modalTitulo: { ...typography.h3, marginBottom: spacing.md },
  inputLabel: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.xs },
  input: { backgroundColor: colors.background, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
  tipoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  tipoOpcao: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border },
  tipoAtivo: { backgroundColor: colors.teal, borderColor: colors.teal },
  tipoTexto: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tipoTextoAtivo: { color: 'white' },
  frequenciaRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  frequenciaOpcao: { flex: 1, padding: spacing.xs + 2, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  frequenciaAtiva: { backgroundColor: colors.teal, borderColor: colors.teal },
  frequenciaTexto: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
  frequenciaTextoAtivo: { color: 'white' },
  diasContainer: { marginBottom: spacing.md },
  diasRow: { flexDirection: 'row', gap: spacing.xs },
  diaBtn: { flex: 1, aspectRatio: 1, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  diaBtnAtivo: { backgroundColor: colors.teal, borderColor: colors.teal },
  diaBtnTexto: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  diaBtnTextoAtivo: { color: 'white' },
  horariosSugeridos: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  horarioSugerido: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  horarioSugeridoAtivo: { backgroundColor: colors.teal, borderColor: colors.teal },
  horarioSugeridoTexto: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  horarioSugeridoTextoAtivo: { color: 'white' },
  horarioCustomRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  horarioCustomBtn: { width: 48, height: 48, borderRadius: radii.md, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  horarioCustomBtnTexto: { color: 'white', fontSize: 24, fontWeight: '300' },
  duracaoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  duracaoOpcao: { flex: 1, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  duracaoAtiva: { backgroundColor: colors.teal, borderColor: colors.teal },
  duracaoTexto: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
  duracaoTextoAtivo: { color: 'white' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  toggleLabel: { ...typography.body, fontWeight: '600' },
  toggleDesc: { ...typography.caption, marginTop: 2 },
  modalBotoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  botaoCancelar: { flex: 1, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  botaoCancelarTexto: { ...typography.body, color: colors.textSecondary },
  botaoSalvar: { flex: 1, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center' },
  botaoSalvarDesabilitado: { opacity: 0.4 },
  botaoSalvarTexto: { ...typography.body, color: 'white', fontWeight: '600' },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  emojiOpcao: { width: 48, height: 48, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  emojiSelecionado: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
})