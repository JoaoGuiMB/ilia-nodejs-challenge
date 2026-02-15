import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import { createUserSchema, type CreateUserFormData } from '@/schemas'
import { usersApi } from '@/services/api'

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  })

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setError(null)
      await usersApi.register(data)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    }
  }

  return (
    <Box>
      <Heading as="h2" size="lg" textAlign="center" mb={6} color="fg.default">
        Create Account
      </Heading>

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

          <Stack direction={{ base: 'column', sm: 'row' }} gap={4}>
            <Field.Root invalid={!!errors.first_name} flex={1}>
              <Field.Label color="fg.default">First Name</Field.Label>
              <Input
                type="text"
                placeholder="John"
                {...register('first_name')}
                bg="bg.surface"
                borderColor="border.default"
              />
              {errors.first_name && (
                <Field.ErrorText>{errors.first_name.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.last_name} flex={1}>
              <Field.Label color="fg.default">Last Name</Field.Label>
              <Input
                type="text"
                placeholder="Doe"
                {...register('last_name')}
                bg="bg.surface"
                borderColor="border.default"
              />
              {errors.last_name && (
                <Field.ErrorText>{errors.last_name.message}</Field.ErrorText>
              )}
            </Field.Root>
          </Stack>

          <Field.Root invalid={!!errors.email}>
            <Field.Label color="fg.default">Email</Field.Label>
            <Input
              type="email"
              placeholder="john.doe@example.com"
              {...register('email')}
              bg="bg.surface"
              borderColor="border.default"
            />
            {errors.email && (
              <Field.ErrorText>{errors.email.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label color="fg.default">Password</Field.Label>
            <Input
              type="password"
              placeholder="At least 8 characters"
              {...register('password')}
              bg="bg.surface"
              borderColor="border.default"
            />
            {errors.password && (
              <Field.ErrorText>{errors.password.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Button
            type="submit"
            colorPalette="blue"
            width="full"
            loading={isSubmitting}
            loadingText="Creating account..."
            mt={2}
          >
            Create Account
          </Button>
        </Stack>
      </form>

      <Text textAlign="center" mt={6} color="fg.muted" fontSize="sm">
        Already have an account?{' '}
        <Link asChild color="blue.500">
          <RouterLink to="/login">Sign in</RouterLink>
        </Link>
      </Text>
    </Box>
  )
}
