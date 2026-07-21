import { SizableText } from '@hanzo/gui'
import { paper, ink, inkHover, inkPress } from './theme'

/**
 * The one primary action in the app: a solid ink button set on paper. Built from
 * a pressable @hanzo/gui text primitive so the whole app's chrome is one system
 * (set text, not a second control family) and the label colour is ours to set —
 * the gui Button frame doesn't take a `color` prop.
 */
export function InkButton({
  label,
  onPress,
  disabled = false,
  fontSize = 16,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  fontSize?: number
}) {
  return (
    <SizableText
      onPress={disabled ? undefined : onPress}
      cursor={disabled ? 'default' : 'pointer'}
      backgroundColor={ink}
      color={paper}
      fontSize={fontSize}
      textAlign="center"
      paddingHorizontal="$5"
      paddingVertical="$3"
      borderRadius={2}
      opacity={disabled ? 0.45 : 1}
      hoverStyle={{ backgroundColor: inkHover }}
      pressStyle={{ backgroundColor: inkPress }}
    >
      {label}
    </SizableText>
  )
}
