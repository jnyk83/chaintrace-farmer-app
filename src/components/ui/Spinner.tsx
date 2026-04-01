import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native'
import { COLORS } from '@/constants/config'

interface SpinnerProps {
  size?: ActivityIndicatorProps['size']
  color?: string
}

export default function Spinner({ size = 'small', color = COLORS.brand }: SpinnerProps) {
  return <ActivityIndicator size={size} color={color} />
}
