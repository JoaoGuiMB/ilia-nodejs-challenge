import { useTranslation } from 'react-i18next'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { formatCurrency } from '@/utils/format-currency'

interface TransactionItemProps {
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  date: string;
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function TransactionItem({ type, amount, date }: TransactionItemProps) {
  const { t, i18n } = useTranslation()
  const isCredit = type === 'CREDIT'
  const sign = isCredit ? '+' : '-'
  const colorScheme = isCredit ? 'green' : 'red'
  const typeLabel = isCredit ? t('transactions.credit') : t('transactions.debit')

  return (
    <Box
      bg="bg.surface"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.default"
      p={{ base: 4, md: 5 }}
      w="full"
      transition="all 0.2s"
      _hover={{
        borderColor: `${colorScheme}.300`,
        shadow: 'sm',
      }}
      role="article"
      aria-label={`${typeLabel} ${sign}${formatCurrency(amount)}`}
    >
      <HStack justify="space-between" align="center">
        <VStack align="start" gap={1}>
          <HStack gap={2}>
            <Box
              w={{ base: 8, md: 10 }}
              h={{ base: 8, md: 10 }}
              borderRadius="full"
              bg={isCredit ? 'green.100' : 'red.100'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize={{ base: 'md', md: 'lg' }}
              aria-hidden="true"
            >
              {isCredit ? '↑' : '↓'}
            </Box>
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="medium"
              color="fg.default"
            >
              {typeLabel}
            </Text>
          </HStack>
          <Text
            fontSize={{ base: 'xs', md: 'sm' }}
            color="fg.muted"
            pl={{ base: 10, md: 12 }}
          >
            {formatDate(date, i18n.language)}
          </Text>
        </VStack>

        <Text
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="bold"
          color={isCredit ? 'green.600' : 'red.600'}
        >
          {sign}{formatCurrency(amount)}
        </Text>
      </HStack>
    </Box>
  )
}
