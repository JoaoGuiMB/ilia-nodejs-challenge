import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
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
      setError(err instanceof Error ? err.message : 'Failed to create transaction')
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
        New Transaction
      </Text>

      <form onSubmit={handleSubmit(onSubmit)}>
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

          {success && (
            <Box
              p={3}
              bg="green.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="green.200"
            >
              <Text color="green.600" fontSize="sm">
                Transaction created successfully!
              </Text>
            </Box>
          )}

          <Field.Root invalid={!!errors.type}>
            <Field.Label color="fg.default">Type</Field.Label>
            <HStack gap={2}>
              <Button
                type="button"
                size={{ base: 'sm', md: 'md' }}
                flex={1}
                variant={selectedType === 'CREDIT' ? 'solid' : 'outline'}
                colorPalette={selectedType === 'CREDIT' ? 'green' : 'gray'}
                onClick={() => setValue('type', 'CREDIT')}
              >
                Credit (+)
              </Button>
              <Button
                type="button"
                size={{ base: 'sm', md: 'md' }}
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

          <Button
            type="submit"
            colorPalette="blue"
            width="full"
            loading={isLoading}
            loadingText="Creating..."
            mt={2}
          >
            Create Transaction
          </Button>
        </Stack>
      </form>
    </Box>
  )
}
