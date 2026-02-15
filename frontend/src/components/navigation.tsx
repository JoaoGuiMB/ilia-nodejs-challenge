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
    >
      {children}
    </Button>
  )
}

export function Navigation() {
  return (
    <Box as="nav">
      <HStack gap={{ base: 1, md: 2 }}>
        <NavItem to="/dashboard">Dashboard</NavItem>
        <NavItem to="/transactions">Transactions</NavItem>
      </HStack>
    </Box>
  )
}
