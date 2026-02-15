import { useState } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
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
import { loginSchema, type LoginFormData } from '@/schemas'
import { useAuth } from '@/hooks/use-auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login(data)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  return (
    <Box>
      <Heading as="h2" size="lg" textAlign="center" mb={6} color="fg.default">
        Sign In
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

          <Field.Root invalid={!!errors.email}>
            <Field.Label color="fg.default">Email</Field.Label>
            <Input
              type="email"
              placeholder="Enter your email"
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
              placeholder="Enter your password"
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
            loadingText="Signing in..."
            mt={2}
          >
            Sign In
          </Button>
        </Stack>
      </form>

      <Text textAlign="center" mt={6} color="fg.muted" fontSize="sm">
        Don&apos;t have an account?{' '}
        <Link asChild color="blue.500">
          <RouterLink to="/register">Create one</RouterLink>
        </Link>
      </Text>
    </Box>
  )
}
