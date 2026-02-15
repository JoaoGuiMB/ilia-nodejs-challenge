import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
  Field,
  HStack,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react'
import { createTransactionFormSchema, type CreateTransactionFormInput } from '@/schemas'
import { useCreateTransaction } from '@/hooks/use-transactions'
import { translateError } from '@/utils/translate-error'

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { t } = useTranslation()
  const { createTransaction, isLoading } = useCreateTransaction()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTransactionFormInput>({
    resolver: zodResolver(createTransactionFormSchema),
    defaultValues: {
      type: 'CREDIT',
      amount: undefined,
    },
  })

  const selectedType = watch('type')

  const onSubmit = async (data: CreateTransactionFormInput) => {
    try {
      setError(null)
      setSuccess(false)
      await createTransaction(data)
      setSuccess(true)
      reset()
      onSuccess?.()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('transactions.createFailed')
      setError(translateError(errorMessage, t))
    }
  }

  return (
    <Box
      bg="bg.surface"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.default"
      p={{ base: 5, md: 6 }}
      w="full"
    >
      <Text
        fontSize={{ base: 'lg', md: 'xl' }}
        fontWeight="semibold"
        color="fg.default"
        mb={4}
      >
        {t('transactions.newTransaction')}
      </Text>

      <form onSubmit={handleSubmit(onSubmit)} aria-label={t('transactions.newTransaction')}>
        <Stack gap={4}>
          {error && (
            <Box
              p={3}
              bg="red.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="red.200"
              role="alert"
            >
              <Text color="red.600" fontSize="sm">
                {error}
              </Text>
            </Box>
          )}

          {success && (
            <Box
              p={3}
              bg="green.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="green.200"
              role="status"
              aria-live="polite"
            >
              <Text color="green.600" fontSize="sm">
                {t('transactions.createSuccess')}
              </Text>
            </Box>
          )}

          <Field.Root invalid={!!errors.type}>
            <Field.Label color="fg.default">{t('transactions.type')}</Field.Label>
            <HStack gap={2} role="group" aria-label={t('accessibility.transactionType')}>
              <Button
                type="button"
                size={{ base: 'sm', md: 'md' }}
                flex={1}
                variant={selectedType === 'CREDIT' ? 'solid' : 'outline'}
                colorPalette={selectedType === 'CREDIT' ? 'green' : 'gray'}
                onClick={() => setValue('type', 'CREDIT')}
                aria-pressed={selectedType === 'CREDIT'}
              >
                {t('transactions.creditButton')}
              </Button>
              <Button
                type="button"
                size={{ base: 'sm', md: 'md' }}
                flex={1}
                variant={selectedType === 'DEBIT' ? 'solid' : 'outline'}
                colorPalette={selectedType === 'DEBIT' ? 'red' : 'gray'}
                onClick={() => setValue('type', 'DEBIT')}
                aria-pressed={selectedType === 'DEBIT'}
              >
                {t('transactions.debitButton')}
              </Button>
            </HStack>
            <input type="hidden" {...register('type')} />
            {errors.type && (
              <Field.ErrorText>{errors.type.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.amount}>
            <Field.Label color="fg.default" htmlFor="amount">{t('transactions.amount')}</Field.Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder={t('transactions.amountPlaceholder')}
              {...register('amount')}
              bg="bg.surface"
              borderColor="border.default"
              aria-describedby={errors.amount ? 'amount-error' : undefined}
            />
            {errors.amount && (
              <Field.ErrorText id="amount-error">{errors.amount.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Button
            type="submit"
            colorPalette="blue"
            width="full"
            loading={isLoading}
            loadingText={t('transactions.creatingTransaction')}
            mt={2}
          >
            {t('transactions.createTransaction')}
          </Button>
        </Stack>
      </form>
    </Box>
  )
}
