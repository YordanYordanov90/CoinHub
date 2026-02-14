import { useMutation } from '@tanstack/react-query';
import type { PredictionMarket } from '@/lib/predictions/types';

interface PredictionsRequest {
  limit?: number;
}

async function fetchPredictions(body?: PredictionsRequest): Promise<PredictionMarket[]> {
  const res = await fetch('/api/predictions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });

  if (!res.ok) {
    const responseBody = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(responseBody?.error ?? 'Failed to generate predictions');
  }

  return res.json();
}

export function usePredictions() {
  return useMutation({
    mutationKey: ['predictions'],
    mutationFn: (payload?: PredictionsRequest) => fetchPredictions(payload),
  });
}
