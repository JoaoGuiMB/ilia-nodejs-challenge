import { Alert, Button, VStack, Text } from '@chakra-ui/react'

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <Alert.Root status="error" borderRadius="md">
      <Alert.Indicator />
      <VStack align="start" gap={2} flex={1}>
        <Alert.Title>Error</Alert.Title>
        <Text fontSize="sm">{message}</Text>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
      </VStack>
    </Alert.Root>
  )
}
