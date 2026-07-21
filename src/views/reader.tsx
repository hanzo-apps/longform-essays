import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Paragraph, SizableText, Spinner } from '@hanzo/gui'
import { paper, ink, inkSoft, footnote, accent } from '../lib/theme'
import { blocks, formatDate, type Essay } from '../lib/essays'

interface ReaderProps {
  id: string
  onBack: () => void
  onEdit: (id: string) => void
}

/**
 * The reading view: a single narrow column (~66ch) set in a book serif with
 * generous leading, a drop-cap on the opening paragraph, and footnote-gray
 * metadata. The body is rendered from its markdown blocks — paragraphs, section
 * headings, and pull quotes. Distraction-free by construction.
 */
export function Reader({ id, onBack, onEdit }: ReaderProps) {
  const { data, isLoading, error } = useQuery<Essay>('essays', {
    filter: `id = "${id}"`,
    realtime: false,
  })
  const essay = data[0]

  if (isLoading) {
    return (
      <XStack alignItems="center" justifyContent="center" gap="$3" paddingVertical="$10" backgroundColor={paper}>
        <Spinner color={ink} />
        <SizableText color={footnote} fontSize={16}>
          Opening…
        </SizableText>
      </XStack>
    )
  }

  if (error || !essay) {
    return (
      <YStack maxWidth={640} width="100%" alignSelf="center" paddingHorizontal="$5" paddingVertical="$8" gap="$3">
        <SizableText color={ink} fontSize={24} fontStyle="italic">
          This essay couldn’t be opened.
        </SizableText>
        {error ? (
          <SizableText color={footnote} fontSize={15}>
            {error.message}
          </SizableText>
        ) : null}
        <SizableText onPress={onBack} cursor="pointer" color={accent} fontSize={16} hoverStyle={{ opacity: 0.7 }}>
          ← Back to the index
        </SizableText>
      </YStack>
    )
  }

  const parsed = blocks(essay.body)
  const firstPara = parsed.findIndex((b) => b.kind === 'para')
  const meta = essay.published
    ? `${formatDate(essay.published_at) || 'Undated'} · ${essay.reading_minutes} min read`
    : `Draft · ${essay.reading_minutes} min`

  return (
    <YStack backgroundColor={paper}>
      <YStack maxWidth={640} width="100%" alignSelf="center" paddingHorizontal="$5" paddingVertical="$7">
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
          <SizableText onPress={onBack} cursor="pointer" color={footnote} fontSize={15} hoverStyle={{ color: ink }}>
            ← Index
          </SizableText>
          <SizableText onPress={() => onEdit(essay.id)} cursor="pointer" color={footnote} fontSize={15} hoverStyle={{ color: ink }}>
            Edit
          </SizableText>
        </XStack>

        <SizableText color={ink} fontSize={45} lineHeight={51} fontWeight="700" letterSpacing={-0.5}>
          {essay.title || 'Untitled'}
        </SizableText>
        {essay.subtitle ? (
          <SizableText color={inkSoft} fontSize={23} lineHeight={30} fontStyle="italic" marginTop="$2">
            {essay.subtitle}
          </SizableText>
        ) : null}
        <SizableText color={footnote} fontSize={14} letterSpacing={0.5} marginTop="$3" marginBottom="$6">
          {meta}
        </SizableText>

        {parsed.length === 0 ? (
          <SizableText color={footnote} fontSize={18} fontStyle="italic">
            (This essay has no body yet.)
          </SizableText>
        ) : (
          parsed.map((block, i) => {
            if (block.kind === 'heading') {
              return (
                <SizableText key={i} color={ink} fontSize={25} lineHeight={31} fontWeight="600" marginTop="$5" marginBottom="$1">
                  {block.text}
                </SizableText>
              )
            }
            if (block.kind === 'quote') {
              return (
                <YStack key={i} borderLeftWidth={2} borderColor={accent} paddingLeft="$4" marginVertical="$4">
                  <SizableText color={inkSoft} fontSize={22} lineHeight={32} fontStyle="italic">
                    {block.text}
                  </SizableText>
                </YStack>
              )
            }
            return (
              <Paragraph
                key={i}
                className={i === firstPara ? 'lf-drop lf-read' : 'lf-read'}
                color={inkSoft}
                fontSize={20}
                lineHeight={34}
                marginTop={0}
                marginBottom="$4"
              >
                {block.text}
              </Paragraph>
            )
          })
        )}
      </YStack>
    </YStack>
  )
}
