import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, SizableText, Separator, Spinner } from '@hanzo/gui'
import { ink, inkSoft, footnote, rule, accent } from '../lib/theme'
import { shelve, formatDate, type Essay } from '../lib/essays'

interface ContentsProps {
  onRead: (id: string) => void
  onEdit: (id: string) => void
  onWrite: () => void
}

/** One essay row — a title, an optional subtitle, and a footnote-gray meta line. */
function Row({
  essay,
  meta,
  onPress,
}: {
  essay: Essay
  meta: string
  onPress: () => void
}) {
  return (
    <YStack gap="$1" paddingVertical="$3" cursor="pointer" onPress={onPress} hoverStyle={{ opacity: 0.66 }}>
      <SizableText color={ink} fontSize={25} lineHeight={31} fontWeight="600">
        {essay.title || 'Untitled'}
      </SizableText>
      {essay.subtitle ? (
        <SizableText color={inkSoft} fontSize={18} lineHeight={25} fontStyle="italic">
          {essay.subtitle}
        </SizableText>
      ) : null}
      <SizableText color={footnote} fontSize={14} marginTop="$1">
        {meta}
      </SizableText>
    </YStack>
  )
}

/** A year marker: the year on the left, a hairline rule filling the rest. */
function YearRule({ year }: { year: number }) {
  return (
    <XStack alignItems="center" gap="$4" marginTop="$7" marginBottom="$1">
      <SizableText color={footnote} fontSize={14} letterSpacing={2}>
        {year > 0 ? year : 'Undated'}
      </SizableText>
      <Separator flex={1} borderColor={rule} />
    </XStack>
  )
}

/**
 * The essay index — the table of contents. Drafts gather at the top while you
 * write them; published essays fall under a year marker, newest first. No cards
 * and no grid: a single measured column of rows, the way a book lists its parts.
 */
export function Contents({ onRead, onEdit, onWrite }: ContentsProps) {
  const { data, isLoading, error } = useQuery<Essay>('essays', { sort: '-created', realtime: false })
  const { drafts, years } = shelve(data)
  const empty = !isLoading && !error && data.length === 0

  return (
    <YStack maxWidth={680} width="100%" alignSelf="center" paddingHorizontal="$5" paddingVertical="$6" gap="$1">
      <SizableText color={footnote} fontSize={13} letterSpacing={3} textTransform="uppercase" marginBottom="$2">
        Selected writing
      </SizableText>

      {isLoading ? (
        <XStack alignItems="center" gap="$3" paddingVertical="$6">
          <Spinner color={ink} />
          <SizableText color={footnote} fontSize={16}>
            Gathering your essays…
          </SizableText>
        </XStack>
      ) : error ? (
        <SizableText color={accent} fontSize={16} lineHeight={24} paddingVertical="$4">
          Couldn’t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you’re signed in.
        </SizableText>
      ) : empty ? (
        <YStack gap="$3" paddingVertical="$9" alignItems="flex-start">
          <SizableText color={ink} fontSize={27} lineHeight={34} fontStyle="italic">
            Nothing here yet.
          </SizableText>
          <SizableText color={footnote} fontSize={17} lineHeight={25} maxWidth={460}>
            Your essays will gather here, newest first, indexed by year. The page stays out of the way.
          </SizableText>
          <SizableText onPress={onWrite} cursor="pointer" color={accent} fontSize={17} marginTop="$2" hoverStyle={{ opacity: 0.7 }}>
            Write your first essay →
          </SizableText>
        </YStack>
      ) : (
        <>
          {drafts.length > 0 ? (
            <>
              <XStack alignItems="center" gap="$4" marginTop="$4" marginBottom="$1">
                <SizableText color={accent} fontSize={14} letterSpacing={2} textTransform="uppercase">
                  Drafts
                </SizableText>
                <Separator flex={1} borderColor={rule} />
              </XStack>
              {drafts.map((essay) => (
                <Row
                  key={essay.id}
                  essay={essay}
                  meta={`Draft · ${essay.reading_minutes} min`}
                  onPress={() => onEdit(essay.id)}
                />
              ))}
            </>
          ) : null}

          {years.map(({ year, essays }) => (
            <YStack key={year}>
              <YearRule year={year} />
              {essays.map((essay) => (
                <Row
                  key={essay.id}
                  essay={essay}
                  meta={`${formatDate(essay.published_at) || 'Unpublished date'} · ${essay.reading_minutes} min read`}
                  onPress={() => onRead(essay.id)}
                />
              ))}
            </YStack>
          ))}
        </>
      )}
    </YStack>
  )
}
