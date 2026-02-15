import { Box, Container, Heading, Text, Button, Flex } from '@chakra-ui/react'
import { useAuth } from '@/hooks/use-auth'
import { ThemeToggle } from '@/components/theme-toggle'

export function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <Box minH="100vh" bg="bg.canvas">
      <Box bg="bg.surface" borderBottomWidth="1px" borderColor="border.default" py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="lg" color="fg.default">FinTech Wallet</Heading>
            <Flex gap={2} align="center">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <Heading size="xl" color="fg.default" mb={2}>
          Welcome back, {user?.first_name}!
        </Heading>
        <Text color="fg.muted">
          This is your dashboard. Balance and transactions will be available in the next task.
        </Text>
      </Container>
    </Box>
  )
}
