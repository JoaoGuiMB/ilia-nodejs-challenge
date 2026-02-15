import { useTranslation } from 'react-i18next'
import { ColorModeButton } from '@/components/ui/ColorMode'

export function ThemeToggle() {
  const { t } = useTranslation()

  return <ColorModeButton aria-label={t('accessibility.toggleTheme')} />
}
