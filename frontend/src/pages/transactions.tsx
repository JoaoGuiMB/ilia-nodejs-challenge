import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Container, Heading, Text, VStack, HStack, Grid, GridItem } from '@chakra-ui/react'
import { useTransactions, type TransactionFilter as FilterType } from '@/hooks/use-transactions'
import { TransactionList } from '@/components/transaction-list'
import { TransactionFilter } from '@/components/transaction-filter'
import { TransactionForm } from '@/components/transaction-form'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ErrorMessage } from '@/components/error-message'

export function TransactionsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterType>('ALL')
  const { transactions, isLoading, error, refetch } = useTransactions(filter)

  return (
    <Container maxW="container.xl" py={{ base: 6, md: 8 }}>
      <VStack gap={{ base: 6, md: 8 }} align="stretch">
        <Box>
          <Heading size={{ base: 'lg', md: 'xl' }} color="fg.default" mb={2}>
            {t('transactions.title')}
          </Heading>
          <Text color="fg.muted" fontSize={{ base: 'sm', md: 'md' }}>
            {t('transactions.subtitle')}
          </Text>
        </Box>

        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 350px' }}
          gap={{ base: 6, md: 8 }}
        >
          <GridItem>
            <VStack gap={4} align="stretch">
              <HStack
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap={3}
              >
                <Text
                  fontSize={{ base: 'md', md: 'lg' }}
                  fontWeight="semibold"
                  color="fg.default"
                >
                  {t('transactions.transactionHistory')}
                </Text>
                <TransactionFilter value={filter} onChange={setFilter} />
              </HStack>

              {isLoading && <LoadingSpinner message={t('transactions.loadingTransactions')} />}

              {error && <ErrorMessage message={error} onRetry={refetch} />}

              {!isLoading && !error && (
                <TransactionList transactions={transactions} />
              )}
            </VStack>
          </GridItem>

          <GridItem>
            <Box position={{ lg: 'sticky' }} top={{ lg: '100px' }}>
              <TransactionForm />
            </Box>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  )
}
