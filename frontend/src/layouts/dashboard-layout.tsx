import { useTranslation } from 'react-i18next'
import { Box, Container, Flex, Heading, Button, HStack } from '@chakra-ui/react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { SkipLink } from '@/components/skip-link'

export function DashboardLayout() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box minH="100vh" bg="bg.canvas">
      <SkipLink />
      <Box
        as="header"
        bg="bg.surface"
        borderBottomWidth="1px"
        borderColor="border.default"
        position="sticky"
        top={0}
        zIndex={10}
        role="banner"
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
                {t('header.appName')}
              </Heading>
              <Box display={{ base: 'block', md: 'none' }}>
                <HStack gap={2}>
                  <LanguageSwitcher />
                  <ThemeToggle />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    aria-label={t('auth.signOut')}
                  >
                    {t('auth.signOut')}
                  </Button>
                </HStack>
              </Box>
            </Flex>

            <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
              <LanguageSwitcher />
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                aria-label={t('auth.signOut')}
              >
                {t('auth.signOut')}
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Box as="main" id="main-content" tabIndex={-1}>
        <Outlet />
      </Box>
    </Box>
  )
}
