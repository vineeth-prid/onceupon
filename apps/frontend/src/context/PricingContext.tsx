import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { PricingConfig, DEFAULT_PRICING } from '@bookmagic/shared';
import { api } from '../api/client';

type PricingContextValue = {
  pricing: PricingConfig;
  loading: boolean;
  refresh: () => Promise<void>;
};

const PricingContext = createContext<PricingContextValue | null>(null);

export function PricingProvider({ children }: { children: ReactNode }) {
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<PricingConfig>('/pricing');
      setPricing({ ...DEFAULT_PRICING, ...res.data });
    } catch (err) {
      console.error('[PricingProvider] failed to fetch pricing', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <PricingContext.Provider value={{ pricing, loading, refresh }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing(): PricingContextValue {
  const ctx = useContext(PricingContext);
  if (!ctx) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return ctx;
}
