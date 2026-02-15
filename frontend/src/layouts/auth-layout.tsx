import { Outlet, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Container, Flex, Heading, Text } from '@chakra-ui/react'
import { useAuth } from '@/hooks/use-auth'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { SkipLink } from '@/components/SkipLink'

export function AuthLayout() {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/transactions" replace />
  }

  return (
    <Box minH="100vh" bg="bg.canvas">
      <SkipLink />
      <Flex
        position="absolute"
        top={4}
        right={4}
        gap={2}
      >
        <LanguageSwitcher />
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
            {t('header.appName')}
          </Heading>
          <Text color="fg.muted" fontSize={{ base: 'sm', md: 'md' }}>
            {t('header.tagline')}
          </Text>
        </Flex>
        <Box
          as="main"
          id="main-content"
          tabIndex={-1}
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
