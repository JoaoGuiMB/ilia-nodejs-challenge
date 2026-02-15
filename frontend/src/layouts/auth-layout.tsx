import { Outlet, Navigate } from 'react-router-dom'
import { Box, Container, Flex, Heading, Text } from '@chakra-ui/react'
import { useAuth } from '@/hooks/use-auth'
import { ThemeToggle } from '@/components/theme-toggle'

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Box minH="100vh" bg="bg.canvas">
      <Flex
        position="absolute"
        top={4}
        right={4}
      >
        <ThemeToggle />
      </Flex>
      <Container maxW="md" py={{ base: 8, md: 16 }}>
        <Flex direction="column" align="center" textAlign="center" mb={8}>
          <Heading
            as="h1"
            size={{ base: 'xl', md: '2xl' }}
            color="fg.default"
            mb={2}
          >
            FinTech Wallet
          </Heading>
          <Text color="fg.muted" fontSize={{ base: 'sm', md: 'md' }}>
            Manage your digital wallet with ease
          </Text>
        </Flex>
        <Box
          bg="bg.surface"
          p={{ base: 6, md: 8 }}
          borderRadius="lg"
          shadow="md"
          borderWidth="1px"
          borderColor="border.default"
        >
          <Outlet />
        </Box>
      </Container>
    </Box>
  )
}
