import { QueryClient } from '@tanstack/react-query';
import type { QueryClient as QueryClientType } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export const queryKeys = {
  games: ['games'] as const,
  gameTitles: (term: string) => ['gameTitles', term] as const,
};

export async function invalidateGameQueries(
  queryClientInstance: QueryClientType,
): Promise<void> {
  await queryClientInstance.invalidateQueries({ queryKey: queryKeys.games });
}
