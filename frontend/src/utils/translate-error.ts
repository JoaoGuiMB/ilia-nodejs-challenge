import type { TFunction } from 'i18next'

const ERROR_MAP: Record<string, string> = {
  'Invalid credentials': 'errors.invalidCredentials',
  'Invalid email or password': 'errors.invalidCredentials',
  'Email already exists': 'errors.emailAlreadyExists',
  'User already exists': 'errors.emailAlreadyExists',
  'Server error': 'errors.serverError',
  'Internal server error': 'errors.serverError',
  'Balance fetch failed': 'errors.balanceFetchFailed',
  'Failed to fetch balance': 'errors.balanceFetchFailed',
  'Network error': 'errors.networkError',
  'Failed to fetch': 'errors.networkError',
  'Unauthorized': 'errors.unauthorized',
  'Session expired': 'errors.sessionExpired',
  'Request failed': 'errors.serverError',
}

export function translateError(message: string, t: TFunction): string {
  const translationKey = ERROR_MAP[message]

  if (translationKey) {
    return t(translationKey)
  }

  // Check for partial matches
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('credential') || lowerMessage.includes('password')) {
    return t('errors.invalidCredentials')
  }

  if (lowerMessage.includes('email') && lowerMessage.includes('exist')) {
    return t('errors.emailAlreadyExists')
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return t('errors.networkError')
  }

  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('401')) {
    return t('errors.unauthorized')
  }

  if (lowerMessage.includes('server') || lowerMessage.includes('500')) {
    return t('errors.serverError')
  }

  // Return original message if no translation found
  return message
}
