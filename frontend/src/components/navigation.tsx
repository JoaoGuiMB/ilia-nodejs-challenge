import { useTranslation } from 'react-i18next'
import { HStack, Button, Box } from '@chakra-ui/react'
import { NavLink, useLocation } from 'react-router-dom'

interface NavItemProps {
  to: string;
  children: React.ReactNode;
}

function NavItem({ to, children }: NavItemProps) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Button
      as={NavLink}
      to={to}
      variant={isActive ? 'solid' : 'ghost'}
      colorPalette={isActive ? 'blue' : 'gray'}
      size={{ base: 'sm', md: 'md' }}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Button>
  )
}

export function Navigation() {
  const { t } = useTranslation()

  return (
    <Box as="nav" aria-label={t('accessibility.mainNavigation')}>
      <HStack gap={{ base: 1, md: 2 }}>
        <NavItem to="/dashboard">{t('nav.dashboard')}</NavItem>
        <NavItem to="/transactions">{t('nav.transactions')}</NavItem>
      </HStack>
    </Box>
  )
}
