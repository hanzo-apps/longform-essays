import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@hanzo/base/react'
import { YStack, XStack, Input, TextArea, SizableText } from '@hanzo/gui'
import { paper, ink, inkSoft, footnote, rule, accent } from '../lib/theme'
import { InkButton } from '../lib/ui'
import { countWords, readingMinutes, type Essay } from '../lib/essays'

interface EditorProps {
  id?: string
  onDone: (id?: string) => void
  onCancel: () => void
}

/** The two-state publish control — draft while you write, published when it's ready. */
function PublishToggle({ published, onChange }: { published: boolean; onChange: (v: boolean) => void }) {
  const Segment = ({ label, active, value }: { label: string; active: boolean; value: boolean }) => (
    <SizableText
      onPress={() => onChange(value)}
      cursor="pointer"
      paddingHorizontal="$3"
      paddingVertical="$2"
      fontSize={14}
      backgroundColor={active ? ink : 'transparent'}
      color={active ? paper : footnote}
    >
      {label}
    </SizableText>
  )
  return (
    <XStack borderWidth={1} borderColor={rule} borderRadius={2} overflow="hidden">
      <Segment label="Draft" active={!published} value={false} />
      <Segment label="Published" active={published} value={true} />
    </XStack>
  )
}

/**
 * The editor: title, subtitle, and a markdown body, set on paper the way you'd
 * read it. Reading time is derived from the body as you type; the publish toggle
 * decides whether an essay shows in the public index. Save creates or updates the
 * `essays` row (org-scoped, carrying the IAM token).
 */
export function Editor({ id, onDone, onCancel }: EditorProps) {
  const editing = Boolean(id)
  const { data } = useQuery<Essay>('essays', {
    filter: id ? `id = "${id}"` : 'id = ""',
    realtime: false,
    enabled: editing,
  })
  const existing = data[0]

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [body, setBody] = useState('')
  const [published, setPublished] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (existing && !hydrated) {
      setTitle(existing.title ?? '')
      setSubtitle(existing.subtitle ?? '')
      setBody(existing.body ?? '')
      setPublished(Boolean(existing.published))
      setHydrated(true)
    }
  }, [existing, hydrated])

  const create = useMutation('essays', 'create')
  const update = useMutation('essays', 'update')
  const remove = useMutation('essays', 'delete')
  const saving = create.isLoading || update.isLoading

  async function save() {
    const t = title.trim()
    if (!t || saving) return
    const fields = {
      title: t,
      subtitle: subtitle.trim(),
      body,
      reading_minutes: readingMinutes(body),
      published,
    }
    if (editing && existing) {
      const published_at =
        published && !existing.published_at ? new Date().toISOString() : existing.published_at || ''
      await update.mutate({ id: existing.id, ...fields, published_at })
      onDone(existing.id)
    } else {
      const published_at = published ? new Date().toISOString() : ''
      await create.mutate({ ...fields, published_at })
      onDone()
    }
  }

  async function del() {
    if (!id) return
    await remove.mutate({ id })
    onCancel()
  }

  const saveLabel = saving ? 'Saving…' : editing ? 'Save' : published ? 'Publish' : 'Save draft'

  return (
    <YStack maxWidth={680} width="100%" alignSelf="center" paddingHorizontal="$5" paddingVertical="$6" gap="$4">
      <SizableText color={footnote} fontSize={13} letterSpacing={3} textTransform="uppercase">
        {editing ? 'Editing' : 'New essay'}
      </SizableText>

      <YStack borderBottomWidth={1} borderColor={rule} paddingBottom="$2">
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          borderWidth={0}
          backgroundColor="transparent"
          paddingHorizontal={0}
          height={54}
          color={ink}
          fontSize={30}
          fontWeight="700"
        />
      </YStack>

      <YStack borderBottomWidth={1} borderColor={rule} paddingBottom="$2">
        <Input
          value={subtitle}
          onChangeText={setSubtitle}
          placeholder="Subtitle (optional)"
          borderWidth={0}
          backgroundColor="transparent"
          paddingHorizontal={0}
          height={38}
          color={inkSoft}
          fontSize={19}
          fontStyle="italic"
        />
      </YStack>

      <TextArea
        value={body}
        onChangeText={setBody}
        placeholder="Write…  ( ## for a section heading · > for a pull quote · blank line for a new paragraph )"
        borderWidth={0}
        backgroundColor="transparent"
        paddingHorizontal={0}
        minHeight={360}
        verticalAlign="top"
        color={inkSoft}
        fontSize={19}
      />

      {create.error || update.error ? (
        <SizableText color={accent} fontSize={15}>
          {(create.error || update.error)?.message}
        </SizableText>
      ) : null}

      <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$4" marginTop="$2">
        <XStack alignItems="center" gap="$4">
          <PublishToggle published={published} onChange={setPublished} />
          <SizableText color={footnote} fontSize={14}>
            {countWords(body)} words · {readingMinutes(body)} min
          </SizableText>
        </XStack>

        <XStack alignItems="center" gap="$5">
          {editing ? (
            <SizableText onPress={del} cursor="pointer" color={accent} fontSize={14} hoverStyle={{ opacity: 0.7 }}>
              Delete
            </SizableText>
          ) : null}
          <SizableText onPress={onCancel} cursor="pointer" color={footnote} fontSize={14} hoverStyle={{ color: ink }}>
            Cancel
          </SizableText>
          <InkButton label={saveLabel} onPress={save} disabled={!title.trim() || saving} fontSize={15} />
        </XStack>
      </XStack>
    </YStack>
  )
}
