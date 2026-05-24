import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, FlatList, StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRef, useState } from 'react'
import { colors, spacing, radii, typography } from '../../theme'
import { ScrollView } from 'react-native-gesture-handler'

const { width, height } = Dimensions.get('window')

const SLIDES = [
  {
    id: '1',
    emoji: '🧠',
    tag: 'Bem-vindo',
    titulo: 'Feito para mentes\nque funcionam diferente',
    descricao: 'O Sidekick é um companheiro diário desenvolvido para pessoas com TDAH — organizado, motivador e inteligente.',
    cor: colors.primary,
    corLight: colors.primaryLight,
    destaques: [
      { icone: '⚡', texto: 'Gamificação que mantém o foco' },
      { icone: '🤖', texto: 'IA integrada ao seu dia a dia' },
      { icone: '💊', texto: 'Suporte completo à saúde' },
    ],
  },
  {
    id: '2',
    emoji: '🎯',
    tag: 'Objetivos',
    titulo: 'Grandes sonhos em\npequenos passos',
    descricao: 'Defina objetivos de curto, médio e longo prazo e acompanhe seu progresso visual em tempo real.',
    cor: '#534AB7',
    corLight: '#EEEDFE',
    destaques: [
      { icone: '📊', texto: 'Barra de progresso por objetivo' },
      { icone: '✅', texto: 'Tarefas vinculadas a cada meta' },
      { icone: '✨', texto: 'IA sugere e segmenta suas tarefas' },
    ],
  },
  {
    id: '3',
    emoji: '📅',
    tag: 'Agenda',
    titulo: 'Nunca mais esqueça\num compromisso',
    descricao: 'Organize seus eventos, defina prazos nas tarefas e receba lembretes automáticos no momento certo.',
    cor: colors.teal,
    corLight: colors.tealLight,
    destaques: [
      { icone: '🔔', texto: 'Lembretes personalizados' },
      { icone: '⚠️', texto: 'Tarefas agrupadas por urgência' },
      { icone: '🗓️', texto: 'Calendário visual completo' },
    ],
  },
  {
    id: '4',
    emoji: '💊',
    tag: 'Cuidados',
    titulo: 'Sua saúde\nem um só lugar',
    descricao: 'Controle medicamentos com alertas de estoque, acompanhe hábitos diários e mantenha sequências motivadoras.',
    cor: colors.pink,
    corLight: colors.pinkLight,
    destaques: [
      { icone: '💊', texto: 'Alarmes de medicamento por horário' },
      { icone: '🔥', texto: 'Streak de hábitos para manter o ritmo' },
      { icone: '🔢', texto: 'Contadores para água, km, horas...' },
    ],
  },
  {
    id: '5',
    emoji: '💭',
    tag: 'Humor',
    titulo: 'Entenda seus\npadrões emocionais',
    descricao: 'Registre como você está ao longo do dia e visualize a variação do seu humor com histórico completo.',
    cor: colors.amber,
    corLight: colors.amberLight,
    destaques: [
      { icone: '😄', texto: 'Registro rápido com emojis' },
      { icone: '🌅', texto: 'Acompanhamento por período do dia' },
      { icone: '📆', texto: 'Histórico com calendário visual' },
    ],
  },
]

export default function OnboardingScreen({ onConcluir, onPular }) {
  const [indexAtual, setIndexAtual] = useState(0)
  const flatListRef = useRef(null)
  const scrollX = useRef(new Animated.Value(0)).current
  const isUltimo = indexAtual === SLIDES.length - 1
  const slideAtual = SLIDES[indexAtual]


  function proximoSlide() {
    if (!isUltimo) {
      flatListRef.current?.scrollToIndex({ index: indexAtual + 1, animated: true })
      setIndexAtual(indexAtual + 1)
    } else {
      onConcluir()
    }
  }

  function voltarSlide() {
    if (indexAtual > 0) {
      flatListRef.current?.scrollToIndex({ index: indexAtual - 1, animated: true })
      setIndexAtual(indexAtual - 1)
    }
  }

  function onMomentumScrollEnd(e) {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setIndexAtual(index)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER FIXO — barra de progresso + fechar */}
      <SafeAreaView style={styles.headerFixo}>
        <View style={styles.headerConteudo}>

          {/* BARRA DE PROGRESSO */}
          <View style={styles.progressoContainer}>
            {SLIDES.map((_, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width]
              const largura = scrollX.interpolate({
                inputRange,
                outputRange: ['0%', '100%', '100%'],
                extrapolate: 'clamp',
              })
              return (
                <View key={i} style={styles.progressoPasso}>
                  <Animated.View
                    style={[
                      styles.progressoPreenchido,
                      {
                        width: i < indexAtual ? '100%' : i === indexAtual ? largura : '0%',
                        backgroundColor: slideAtual.cor,
                      }
                    ]}
                  />
                </View>
              )
            })}
          </View>

          {/* BOTÃO PULAR */}
          <TouchableOpacity style={styles.pularBtn} onPress={onPular}>
            <Text style={styles.pularTexto}>✕</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>

      {/* SLIDES */}
      <Animated.FlatList
        style={{ flex: 1 }}
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => (
          <ScrollView
            style={{ width }}
            contentContainerStyle={styles.slide}
            showsVerticalScrollIndicator={false}
          >

            {/* TAG */}
            <View style={[styles.tag, { backgroundColor: item.corLight }]}>
              <Text style={[styles.tagTexto, { color: item.cor }]}>{item.tag}</Text>
            </View>

            {/* EMOJI */}
            <View style={[styles.emojiContainer, { backgroundColor: item.corLight }]}>
              <Text style={styles.emojiGrande}>{item.emoji}</Text>
            </View>

            {/* TÍTULO */}
            <Text style={[styles.titulo, { color: item.cor }]}>{item.titulo}</Text>

            {/* DESCRIÇÃO */}
            <Text style={styles.descricao}>{item.descricao}</Text>

            {/* DESTAQUES */}
            <View style={styles.destaquesContainer}>
              {item.destaques.map((d, i) => (
                <View key={i} style={[styles.destaqueItem, { backgroundColor: item.corLight }]}>
                  <Text style={styles.destaqueIcone}>{d.icone}</Text>
                  <Text style={[styles.destaqueTexto, { color: item.cor }]}>{d.texto}</Text>
                </View>
              ))}
            </View>

          </ScrollView>
        )}
      />

      {/* RODAPÉ */}
      <View
        style={[
          styles.rodape,
          {
            paddingTop: isUltimo ? spacing.md : 0,
            borderTopWidth: isUltimo ? 1 : 0,
            paddingBottom: isUltimo ? spacing.sm : spacing.md,
          }
        ]}
      ></View>

           {/* BOTÕES */}
      <View style={styles.botoesRow}>
        {indexAtual > 0 ? (
          <TouchableOpacity style={styles.botaoVoltar} onPress={voltarSlide}>
            <Text style={styles.botaoVoltarTexto}>← Voltar</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <TouchableOpacity
          style={[styles.botaoProximo, { backgroundColor: slideAtual.cor }]}
          onPress={proximoSlide}
          activeOpacity={0.85}
        >
          <Text style={styles.botaoProximoTexto}>
            {isUltimo ? 'Vamos começar! 🚀' : 'Próximo →'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>

  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header fixo
  headerFixo: {
    backgroundColor: colors.background,
    zIndex: 10,
    borderBottomWidth: 0,
  },
  headerConteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  progressoContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    height: 4,
  },
  progressoPasso: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressoPreenchido: {
    height: 4,
    borderRadius: radii.full,
  },
  pularBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pularTexto: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },

  // Slide
  slide: {
    width,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    marginBottom: spacing.lg,
  },
  tagTexto: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emojiContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emojiGrande: { fontSize: 64 },
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 34,
  },
  descricao: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  destaquesContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  destaqueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.md,
  },
  destaqueIcone: { fontSize: 20 },
  destaqueTexto: { ...typography.body, fontWeight: '600', flex: 1 },

  // Rodapé
  // rodape: {
  //   paddingHorizontal: spacing.lg,
  //   paddingBottom: spacing.sm,
  //   backgroundColor: colors.background,
  //   borderTopColor: colors.border,
  //  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: radii.full,
  },
  botoesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  botaoVoltar: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  botaoVoltarTexto: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  botaoProximo: {
    flex: 2,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  botaoProximoTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
})