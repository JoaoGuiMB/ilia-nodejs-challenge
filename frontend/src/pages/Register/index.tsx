import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
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
import { createUserSchema, type CreateUserFormData } from '@/schemas'
import { usersApi } from '@/services/api'
import { translateError } from '@/utils/translate-error'

export function RegisterPage() {
  const { t } = useTranslation()
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
      const errorMessage = err instanceof Error ? err.message : t('auth.registerFailed')
      setError(translateError(errorMessage, t))
    }
  }

  return (
    <Box>
      <Heading as="h2" size="lg" textAlign="center" mb={6} color="fg.default">
        {t('auth.createAccount')}
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)} aria-label={t('auth.createAccount')}>
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

          <Stack direction={{ base: 'column', sm: 'row' }} gap={4}>
            <Field.Root invalid={!!errors.first_name} flex={1}>
              <Field.Label color="fg.default" htmlFor="first_name">{t('auth.firstName')}</Field.Label>
              <Input
                id="first_name"
                type="text"
                placeholder={t('auth.firstNamePlaceholder')}
                {...register('first_name')}
                bg="bg.surface"
                borderColor="border.default"
                aria-describedby={errors.first_name ? 'first_name-error' : undefined}
              />
              {errors.first_name && (
                <Field.ErrorText id="first_name-error">{errors.first_name.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.last_name} flex={1}>
              <Field.Label color="fg.default" htmlFor="last_name">{t('auth.lastName')}</Field.Label>
              <Input
                id="last_name"
                type="text"
                placeholder={t('auth.lastNamePlaceholder')}
                {...register('last_name')}
                bg="bg.surface"
                borderColor="border.default"
                aria-describedby={errors.last_name ? 'last_name-error' : undefined}
              />
              {errors.last_name && (
                <Field.ErrorText id="last_name-error">{errors.last_name.message}</Field.ErrorText>
              )}
            </Field.Root>
          </Stack>

          <Field.Root invalid={!!errors.email}>
            <Field.Label color="fg.default" htmlFor="email">{t('auth.email')}</Field.Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
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
              placeholder={t('auth.passwordHint')}
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
            loadingText={t('auth.creatingAccount')}
            mt={2}
          >
            {t('auth.createAccount')}
          </Button>
        </Stack>
      </form>

      <Text textAlign="center" mt={6} color="fg.muted" fontSize="sm">
        {t('auth.haveAccount')}{' '}
        <Link asChild color="blue.500">
          <RouterLink to="/login">{t('auth.signInLink')}</RouterLink>
        </Link>
      </Text>
    </Box>
  )
}
