import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react'
import { useAuth } from '@/hooks/use-auth'
import { useBalance } from '@/hooks/use-balance'
import { BalanceCard } from '@/components/balance-card'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ErrorMessage } from '@/components/error-message'

export function DashboardPage() {
  const { user } = useAuth()
  const { balance, isLoading, error, refetch } = useBalance()

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
          <BalanceCard balance={balance} />
        )}
      </VStack>
    </Container>
  )
}
