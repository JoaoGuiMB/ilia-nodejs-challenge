import { useTranslation } from 'react-i18next'
import { VStack } from '@chakra-ui/react'
import type { TransactionResponse } from '@/types'
import { TransactionItem } from '@/components/TransactionItem'
import { EmptyState } from '@/components/EmptyState'

interface TransactionListProps {
  transactions: TransactionResponse[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { t } = useTranslation()

  if (transactions.length === 0) {
    return (
      <EmptyState
        title={t('transactions.noTransactions')}
        description={t('transactions.noTransactionsDescription')}
      />
    )
  }

  return (
    <VStack gap={3} align="stretch" w="full" role="list" aria-label={t('transactions.transactionHistory')}>
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
