import { useTranslation } from 'react-i18next'
import { Box, Text, VStack } from '@chakra-ui/react'
import { formatCurrency } from '@/utils/format-currency'

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const { t } = useTranslation()

  return (
    <Box
      bg="bg.surface"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.default"
      p={{ base: 6, md: 8 }}
      shadow="md"
      w="full"
      maxW={{ base: 'full', md: 'md' }}
      role="region"
      aria-label={t('dashboard.currentBalance')}
    >
      <VStack gap={2} align="start">
        <Text
          fontSize={{ base: 'sm', md: 'md' }}
          color="fg.muted"
          fontWeight="medium"
        >
          {t('dashboard.currentBalance')}
        </Text>
        <Text
          fontSize={{ base: '3xl', md: '4xl' }}
          fontWeight="bold"
          color="fg.default"
          lineHeight="1"
          aria-live="polite"
        >
          {formatCurrency(balance)}
        </Text>
      </VStack>
    </Box>
  )
}
