import { Box, Text, VStack } from '@chakra-ui/react'

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Box
      bg="bg.surface"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.default"
      p={{ base: 8, md: 12 }}
      w="full"
      textAlign="center"
    >
      <VStack gap={3}>
        <Box
          fontSize={{ base: '4xl', md: '5xl' }}
          opacity={0.6}
        >
          📋
        </Box>
        <Text
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="semibold"
          color="fg.default"
        >
          {title}
        </Text>
        {description && (
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            color="fg.muted"
            maxW="sm"
          >
            {description}
          </Text>
        )}
      </VStack>
    </Box>
  )
}
