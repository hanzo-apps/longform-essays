import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, SizableText } from '@hanzo/gui'
import { paper, ink, footnote, rule, accent } from '../lib/theme'
import { Contents } from './contents'
import { Reader } from './reader'
import { Editor } from './editor'

/** Which of the three surfaces the writing desk is showing. */
type View =
  | { name: 'contents' }
  | { name: 'reader'; id: string }
  | { name: 'editor'; id?: string }

/** A pressable text link — the app's chrome is set text, not buttons. */
function Link({ label, color = ink, onPress }: { label: string; color?: string; onPress: () => void }) {
  return (
    <SizableText onPress={onPress} cursor="pointer" color={color} fontSize={15} hoverStyle={{ color: accent }}>
      {label}
    </SizableText>
  )
}

/**
 * The signed-in writing desk. No router: a small state machine swaps between the
 * three views (index · reading · editor). A hairline masthead carries the
 * wordmark and the two persistent actions.
 */
export function Home() {
  const { logout } = useIam()
  const [view, setView] = useState<View>({ name: 'contents' })

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={paper}>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        maxWidth={720}
        width="100%"
        alignSelf="center"
        paddingHorizontal="$5"
        paddingVertical="$4"
        borderBottomWidth={1}
        borderColor={rule}
      >
        <SizableText
          onPress={() => setView({ name: 'contents' })}
          cursor="pointer"
          color={ink}
          fontSize={22}
          fontWeight="700"
          letterSpacing={-0.5}
        >
          Longform
        </SizableText>
        <XStack alignItems="center" gap="$5">
          <Link label="Write" onPress={() => setView({ name: 'editor' })} />
          <Link label="Sign out" color={footnote} onPress={() => logout()} />
        </XStack>
      </XStack>

      {view.name === 'contents' && (
        <Contents
          onRead={(id) => setView({ name: 'reader', id })}
          onEdit={(id) => setView({ name: 'editor', id })}
          onWrite={() => setView({ name: 'editor' })}
        />
      )}
      {view.name === 'reader' && (
        <Reader
          id={view.id}
          onBack={() => setView({ name: 'contents' })}
          onEdit={(id) => setView({ name: 'editor', id })}
        />
      )}
      {view.name === 'editor' && (
        <Editor
          id={view.id}
          onDone={(id) => setView(id ? { name: 'reader', id } : { name: 'contents' })}
          onCancel={() => setView({ name: 'contents' })}
        />
      )}
    </YStack>
  )
}
