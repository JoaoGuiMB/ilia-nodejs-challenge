import { RouterProvider } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { AuthProvider } from '@/contexts/AuthContext'
import { router } from '@/router'
import { system } from '@/theme'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <ColorModeProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ColorModeProvider>
      </ChakraProvider>
    </QueryClientProvider>
  )
}

export default App
