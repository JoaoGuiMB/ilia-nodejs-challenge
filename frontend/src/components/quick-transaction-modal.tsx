import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Field,
  HStack,
  Input,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react'
import { createTransactionFormSchema, type CreateTransactionFormInput } from '@/schemas'
import { useCreateTransaction } from '@/hooks/use-transactions'

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType: 'CREDIT' | 'DEBIT';
}

export function QuickTransactionModal({
  isOpen,
  onClose,
  defaultType,
}: QuickTransactionModalProps) {
  const { t } = useTranslation()
  const { createTransaction, isLoading } = useCreateTransaction()
  const [error, setError] = useState<string | null>(null)

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
      type: defaultType,
      amount: undefined,
    },
  })

  const selectedType = watch('type')

  useEffect(() => {
    if (isOpen) {
      setValue('type', defaultType)
      setError(null)
    }
  }, [isOpen, defaultType, setValue])

  const onSubmit = async (data: CreateTransactionFormInput) => {
    try {
      setError(null)
      await createTransaction(data)
      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('transactions.createFailed'))
    }
  }

  const handleClose = () => {
    reset()
    setError(null)
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            mx={4}
            maxW="md"
            w="full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-transaction-title"
          >
            <Dialog.Header>
              <Dialog.Title id="quick-transaction-title">{t('transactions.quickTransaction')}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" aria-label={t('accessibility.closeModal')} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <form id="quick-transaction-form" onSubmit={handleSubmit(onSubmit)} aria-label={t('transactions.quickTransaction')}>
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

                  <Field.Root invalid={!!errors.type}>
                    <Field.Label color="fg.default">{t('transactions.type')}</Field.Label>
                    <HStack gap={2} role="group" aria-label={t('accessibility.transactionType')}>
                      <Button
                        type="button"
                        size="sm"
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
                        size="sm"
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
                    <Field.Label color="fg.default" htmlFor="modal-amount">{t('transactions.amount')}</Field.Label>
                    <Input
                      id="modal-amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder={t('transactions.amountPlaceholder')}
                      {...register('amount')}
                      bg="bg.surface"
                      borderColor="border.default"
                      aria-describedby={errors.amount ? 'modal-amount-error' : undefined}
                    />
                    {errors.amount && (
                      <Field.ErrorText id="modal-amount-error">{errors.amount.message}</Field.ErrorText>
                    )}
                  </Field.Root>
                </Stack>
              </form>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap={3}>
                <Button variant="outline" onClick={handleClose}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  form="quick-transaction-form"
                  colorPalette="blue"
                  loading={isLoading}
                  loadingText={t('transactions.creatingTransaction')}
                >
                  {t('transactions.createTransaction')}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
