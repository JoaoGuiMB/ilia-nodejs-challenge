import { Box, Container, Flex, Heading, Button, Text, HStack } from '@chakra-ui/react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Navigation } from '@/components/navigation'
import { ThemeToggle } from '@/components/theme-toggle'

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box minH="100vh" bg="bg.canvas">
      <Box
        as="header"
        bg="bg.surface"
        borderBottomWidth="1px"
        borderColor="border.default"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="container.xl" py={{ base: 3, md: 4 }}>
          <Flex
            justify="space-between"
            align="center"
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 3, md: 0 }}
          >
            <Flex
              align="center"
              gap={{ base: 3, md: 6 }}
              w={{ base: 'full', md: 'auto' }}
              justify={{ base: 'space-between', md: 'flex-start' }}
            >
              <Heading size={{ base: 'md', md: 'lg' }} color="fg.default">
                FinTech Wallet
              </Heading>
              <Box display={{ base: 'block', md: 'none' }}>
                <HStack gap={2}>
                  <ThemeToggle />
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </HStack>
              </Box>
            </Flex>

            <Box w={{ base: 'full', md: 'auto' }}>
              <Navigation />
            </Box>

            <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
              <Text color="fg.muted" fontSize="sm">
                Hello, {user?.first_name}
              </Text>
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Box as="main">
        <Outlet />
      </Box>
    </Box>
  )
}
