import { VStack } from '@chakra-ui/react'
import type { TransactionResponse } from '@/types'
import { TransactionItem } from './transaction-item'
import { EmptyState } from './empty-state'

interface TransactionListProps {
  transactions: TransactionResponse[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Create your first transaction to get started tracking your finances."
      />
    )
  }

  return (
    <VStack gap={3} align="stretch" w="full">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          type={transaction.type}
          amount={transaction.amount}
          date={transaction.created_at}
        />
      ))}
    </VStack>
  )
}
