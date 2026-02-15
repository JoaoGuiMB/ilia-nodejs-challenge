import { HStack, Button } from '@chakra-ui/react'
import type { TransactionFilter as FilterType } from '@/hooks/use-transactions'

interface TransactionFilterProps {
  value: FilterType;
  onChange: (filter: FilterType) => void;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'DEBIT', label: 'Debit' },
]

export function TransactionFilter({ value, onChange }: TransactionFilterProps) {
  return (
    <HStack gap={2} flexWrap="wrap">
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
          >
            {option.label}
          </Button>
        )
      })}
    </HStack>
  )
}
