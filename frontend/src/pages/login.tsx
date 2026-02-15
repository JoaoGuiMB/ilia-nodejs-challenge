import { useState } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const from = location.state?.from?.pathname || '/transactions'

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
      setError(err instanceof Error ? err.message : t('auth.loginFailed'))
    }
  }

  return (
    <Box>
      <Heading as="h2" size="lg" textAlign="center" mb={6} color="fg.default">
        {t('auth.signIn')}
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)} aria-label={t('auth.signIn')}>
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

          <Field.Root invalid={!!errors.email}>
            <Field.Label color="fg.default" htmlFor="email">{t('auth.email')}</Field.Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              {...register('email')}
              bg="bg.surface"
              borderColor="border.default"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <Field.ErrorText id="email-error">{errors.email.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label color="fg.default" htmlFor="password">{t('auth.password')}</Field.Label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              {...register('password')}
              bg="bg.surface"
              borderColor="border.default"
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <Field.ErrorText id="password-error">{errors.password.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Button
            type="submit"
            colorPalette="blue"
            width="full"
            loading={isSubmitting}
            loadingText={t('auth.signingIn')}
            mt={2}
          >
            {t('auth.signInButton')}
          </Button>
        </Stack>
      </form>

      <Text textAlign="center" mt={6} color="fg.muted" fontSize="sm">
        {t('auth.noAccount')}{' '}
        <Link asChild color="blue.500">
          <RouterLink to="/register">{t('auth.createOne')}</RouterLink>
        </Link>
      </Text>
    </Box>
  )
}
