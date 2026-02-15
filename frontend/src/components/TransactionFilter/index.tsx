import { useTranslation } from 'react-i18next'
import { HStack, Button } from '@chakra-ui/react'
import type { TransactionFilter as FilterType } from '@/hooks/use-transactions'

interface TransactionFilterProps {
  value: FilterType;
  onChange: (filter: FilterType) => void;
}

export function TransactionFilter({ value, onChange }: TransactionFilterProps) {
  const { t } = useTranslation()

  const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
    { value: 'ALL', label: t('transactions.filterAll') },
    { value: 'CREDIT', label: t('transactions.filterCredit') },
    { value: 'DEBIT', label: t('transactions.filterDebit') },
  ]

  return (
    <HStack
      gap={2}
      flexWrap="wrap"
      role="group"
      aria-label={t('accessibility.filterTransactions')}
    >
      {FILTER_OPTIONS.map((option) => {
        const isSelected = value === option.value
        return (
          <Button
            key={option.value}
            size={{ base: 'sm', md: 'md' }}
            variant={isSelected ? 'solid' : 'outline'}
            colorPalette={isSelected ? 'blue' : 'gray'}
            onClick={() => onChange(option.value)}
            minW={{ base: '70px', md: '80px' }}
            aria-pressed={isSelected}
          >
            {option.label}
          </Button>
        )
      })}
    </HStack>
  )
}
