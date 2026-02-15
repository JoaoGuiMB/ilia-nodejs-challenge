import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
      setError(err instanceof Error ? err.message : 'Failed to create transaction')
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
          >
            <Dialog.Header>
              <Dialog.Title>Quick Transaction</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <form id="quick-transaction-form" onSubmit={handleSubmit(onSubmit)}>
                <Stack gap={4}>
                  {error && (
                    <Box
                      p={3}
                      bg="red.50"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="red.200"
                    >
                      <Text color="red.600" fontSize="sm">
                        {error}
                      </Text>
                    </Box>
                  )}

                  <Field.Root invalid={!!errors.type}>
                    <Field.Label color="fg.default">Type</Field.Label>
                    <HStack gap={2}>
                      <Button
                        type="button"
                        size="sm"
                        flex={1}
                        variant={selectedType === 'CREDIT' ? 'solid' : 'outline'}
                        colorPalette={selectedType === 'CREDIT' ? 'green' : 'gray'}
                        onClick={() => setValue('type', 'CREDIT')}
                      >
                        Credit (+)
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        flex={1}
                        variant={selectedType === 'DEBIT' ? 'solid' : 'outline'}
                        colorPalette={selectedType === 'DEBIT' ? 'red' : 'gray'}
                        onClick={() => setValue('type', 'DEBIT')}
                      >
                        Debit (-)
                      </Button>
                    </HStack>
                    <input type="hidden" {...register('type')} />
                    {errors.type && (
                      <Field.ErrorText>{errors.type.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.amount}>
                    <Field.Label color="fg.default">Amount ($)</Field.Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter amount"
                      {...register('amount')}
                      bg="bg.surface"
                      borderColor="border.default"
                    />
                    {errors.amount && (
                      <Field.ErrorText>{errors.amount.message}</Field.ErrorText>
                    )}
                  </Field.Root>
                </Stack>
              </form>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap={3}>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="quick-transaction-form"
                  colorPalette="blue"
                  loading={isLoading}
                  loadingText="Creating..."
                >
                  Create Transaction
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
