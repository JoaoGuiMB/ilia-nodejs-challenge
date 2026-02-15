import { Center, Spinner, Text, VStack } from '@chakra-ui/react'

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <Center py={8}>
      <VStack gap={4}>
        <Spinner
          size="xl"
          color="blue.500"
          borderWidth="4px"
        />
        <Text color="fg.muted" fontSize="sm">
          {message}
        </Text>
      </VStack>
    </Center>
  )
}
