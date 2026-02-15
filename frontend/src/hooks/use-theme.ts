import { useColorMode } from '@/components/ui/ColorMode'

export function useTheme() {
  const { colorMode, setColorMode, toggleColorMode } = useColorMode()

  const isDark = colorMode === 'dark'
  const isLight = colorMode === 'light'

  return {
    colorMode,
    isDark,
    isLight,
    toggleColorMode,
    setColorMode,
  }
}
