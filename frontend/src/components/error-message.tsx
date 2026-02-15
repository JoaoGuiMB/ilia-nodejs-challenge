import { useTranslation } from 'react-i18next'
import { Alert, Button, VStack, Text } from '@chakra-ui/react'

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { t } = useTranslation()

  return (
    <Alert.Root status="error" borderRadius="md" role="alert">
      <Alert.Indicator />
      <VStack align="start" gap={2} flex={1}>
        <Alert.Title>{t('common.error')}</Alert.Title>
        <Text fontSize="sm">{message}</Text>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            onClick={onRetry}
          >
            {t('common.retry')}
          </Button>
        )}
      </VStack>
    </Alert.Root>
  )
}
