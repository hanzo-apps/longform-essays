import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, Paragraph, SizableText, Separator } from '@hanzo/gui'
import { paper, ink, inkSoft, footnote, rule } from '../lib/theme'
import { InkButton } from '../lib/ui'

/**
 * The signed-out landing — the public, honest thumbnail of the app. Set like the
 * title page of a book: a cream sheet, a large serif wordmark, the tagline, one
 * drop-capped paragraph of intent, and a single call to sign in. One action:
 * PKCE sign-in with Hanzo (hanzo.id). There is no local credential form.
 */
export function Landing() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={paper} alignItems="center" justifyContent="center" padding="$6">
      <YStack maxWidth={660} width="100%" gap="$5">
        <SizableText color={footnote} fontSize={13} letterSpacing={4} textTransform="uppercase">
          An essay blog
        </SizableText>

        <YStack gap="$3">
          <H1 color={ink} fontSize={92} lineHeight={92} fontWeight="700" letterSpacing={-2} margin={0}>
            Longform
          </H1>
          <SizableText color={inkSoft} fontSize={27} lineHeight={34} fontStyle="italic">
            A home for your writing.
          </SizableText>
        </YStack>

        <Separator borderColor={rule} />

        <SizableText color={ink} fontSize={22} lineHeight={30} fontStyle="italic">
          Words first. Everything else second.
        </SizableText>

        <Paragraph className="lf-drop lf-read" color={inkSoft} fontSize={20} lineHeight={34} maxWidth={580} margin={0}>
          Longform is a quiet place to write and publish long reads — no cards, no
          grids, no infinite feed. Readers get a single narrow column set in a book
          serif, an honest estimate of the time ahead, and an index of everything
          you have written, gathered by year. You write; the page gets out of the way.
        </Paragraph>

        <XStack alignItems="center" gap="$5" marginTop="$4" flexWrap="wrap">
          <InkButton label={isLoading ? 'Loading…' : 'Start writing'} disabled={isLoading} onPress={() => login()} fontSize={17} />
          <SizableText color={footnote} fontSize={15}>
            Sign in with Hanzo — private to you until you publish.
          </SizableText>
        </XStack>
      </YStack>
    </YStack>
  )
}
