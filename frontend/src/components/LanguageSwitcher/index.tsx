import { useTranslation } from 'react-i18next'
import { Button, Menu, Portal, Box, Image, HStack } from '@chakra-ui/react'

const LANGUAGES = [
  {
    code: 'en',
    label: 'English',
    flagUrl: 'https://flagcdn.com/w40/us.png',
    flagAlt: 'USA flag',
  },
  {
    code: 'pt',
    label: 'Português',
    flagUrl: 'https://flagcdn.com/w40/br.png',
    flagAlt: 'Brazil flag',
  },
] as const

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const currentLanguage =
    LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0]

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
  }

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('accessibility.selectLanguage')}
        >
          <HStack gap={2}>
            <Image
              src={currentLanguage.flagUrl}
              alt={currentLanguage.flagAlt}
              w="20px"
              h="15px"
              objectFit="cover"
              borderRadius="sm"
            />
            <Box as="span">{currentLanguage.label}</Box>
            <Box as="span" fontSize="xs">&#9660;</Box>
          </HStack>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="150px">
            {LANGUAGES.map((lang) => (
              <Menu.Item
                key={lang.code}
                value={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <HStack gap={2}>
                  <Image
                    src={lang.flagUrl}
                    alt={lang.flagAlt}
                    w="20px"
                    h="15px"
                    objectFit="cover"
                    borderRadius="sm"
                  />
                  <Box as="span">{lang.label}</Box>
                </HStack>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
