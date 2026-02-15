import { RouterProvider } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { AuthProvider } from '@/contexts/AuthContext'
import { router } from '@/router'
import { system } from '@/theme'

function App() {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ColorModeProvider>
    </ChakraProvider>
  )
}

export default App
