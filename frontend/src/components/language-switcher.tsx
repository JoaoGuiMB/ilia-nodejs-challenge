import { useTranslation } from 'react-i18next'
import { Button, HStack } from '@chakra-ui/react'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
] as const

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
  }

  return (
    <HStack gap={1} role="group" aria-label={t('accessibility.selectLanguage')}>
      {LANGUAGES.map((lang) => {
        const isActive = i18n.language === lang.code
        return (
          <Button
            key={lang.code}
            size="sm"
            variant={isActive ? 'solid' : 'ghost'}
            colorPalette={isActive ? 'blue' : 'gray'}
            onClick={() => handleLanguageChange(lang.code)}
            aria-pressed={isActive}
            aria-label={`${lang.label} language`}
            minW="40px"
          >
            {lang.label}
          </Button>
        )
      })}
    </HStack>
  )
}
