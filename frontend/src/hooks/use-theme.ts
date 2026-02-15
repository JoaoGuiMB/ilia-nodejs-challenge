import { useColorMode } from '@/components/ui/color-mode'

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
