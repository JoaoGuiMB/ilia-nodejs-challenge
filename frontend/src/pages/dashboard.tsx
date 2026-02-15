import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Container, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import { useAuth } from '@/hooks/use-auth'
import { useBalance } from '@/hooks/use-balance'
import { BalanceCard } from '@/components/balance-card'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ErrorMessage } from '@/components/error-message'
import { QuickTransactionModal } from '@/components/quick-transaction-modal'

export function DashboardPage() {
  const { user } = useAuth()
  const { balance, isLoading, error, refetch } = useBalance()
  const [quickTransactionType, setQuickTransactionType] = useState<'CREDIT' | 'DEBIT' | null>(null)

  const handleQuickTransactionClose = () => {
    setQuickTransactionType(null)
  }

  return (
    <Container maxW="container.xl" py={{ base: 6, md: 8 }}>
      <VStack gap={{ base: 6, md: 8 }} align="stretch">
        <Box>
          <Heading size={{ base: 'lg', md: 'xl' }} color="fg.default" mb={2}>
            Welcome back, {user?.first_name}!
          </Heading>
          <Text color="fg.muted" fontSize={{ base: 'sm', md: 'md' }}>
            Here&apos;s your financial overview
          </Text>
        </Box>

        {isLoading && <LoadingSpinner message="Loading your balance..." />}

        {error && <ErrorMessage message={error} onRetry={refetch} />}

        {!isLoading && !error && balance !== null && (
          <>
            <BalanceCard balance={balance} />

            <Box>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                fontWeight="semibold"
                color="fg.default"
                mb={3}
              >
                Quick Actions
              </Text>
              <HStack gap={3} flexWrap="wrap">
                <Button
                  colorPalette="green"
                  size={{ base: 'sm', md: 'md' }}
                  onClick={() => setQuickTransactionType('CREDIT')}
                >
                  + Add Credit
                </Button>
                <Button
                  colorPalette="red"
                  size={{ base: 'sm', md: 'md' }}
                  onClick={() => setQuickTransactionType('DEBIT')}
                >
                  - Add Debit
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size={{ base: 'sm', md: 'md' }}
                >
                  <RouterLink to="/transactions">View All Transactions</RouterLink>
                </Button>
              </HStack>
            </Box>
          </>
        )}
      </VStack>

      <QuickTransactionModal
        isOpen={quickTransactionType !== null}
        onClose={handleQuickTransactionClose}
        defaultType={quickTransactionType ?? 'CREDIT'}
      />
    </Container>
  )
}
