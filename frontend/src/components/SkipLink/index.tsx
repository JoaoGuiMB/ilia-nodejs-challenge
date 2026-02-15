import { useTranslation } from 'react-i18next'
import { chakra } from '@chakra-ui/react'

const SkipLinkAnchor = chakra('a')

export function SkipLink() {
  const { t } = useTranslation()

  return (
    <SkipLinkAnchor
      href="#main-content"
      position="absolute"
      left="-9999px"
      zIndex={9999}
      p={4}
      bg="blue.600"
      color="white"
      fontWeight="bold"
      textDecoration="none"
      _focus={{
        left: '50%',
        transform: 'translateX(-50%)',
        top: 4,
        outline: '2px solid',
        outlineColor: 'blue.300',
        outlineOffset: '2px',
      }}
    >
      {t('common.skipToContent')}
    </SkipLinkAnchor>
  )
}
