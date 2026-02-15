import { useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { VStack, Center, Spinner, Text } from '@chakra-ui/react'
import type { TransactionResponse } from '@/types'
import { TransactionItem } from '@/components/TransactionItem'
import { EmptyState } from '@/components/EmptyState'

interface TransactionListProps {
  transactions: TransactionResponse[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export function TransactionList({
  transactions,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: TransactionListProps) {
  const { t } = useTranslation()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && onLoadMore) {
        onLoadMore()
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    })

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [handleIntersection])

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

      <div ref={loadMoreRef} aria-hidden="true" />

      {isFetchingNextPage && (
        <Center py={4} role="status" aria-label={t('transactions.loadingMore')}>
          <VStack gap={2}>
            <Spinner size="md" color="brand.500" />
            <Text fontSize="sm" color="fg.muted">
              {t('transactions.loadingMore')}
            </Text>
          </VStack>
        </Center>
      )}
    </VStack>
  )
}
