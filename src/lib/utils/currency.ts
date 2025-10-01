export type Currency = 'gbp' | 'usd' | 'eur';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  amount: number; // in cents
  display: string;
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  gbp: { code: 'gbp', symbol: '£', amount: 399, display: '£3.99' },
  usd: { code: 'usd', symbol: '$', amount: 399, display: '$3.99' },
  eur: { code: 'eur', symbol: '€', amount: 399, display: '€3.99' },
};

const CURRENCY_STORAGE_KEY = 'tattoo-currency';

export async function detectUserCurrency(): Promise<Currency> {
  try {
    // Try to get from localStorage first
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored && stored in CURRENCIES) {
      return stored as Currency;
    }

    // Detect country via IP
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    const countryCode = data.country_code?.toLowerCase();
    
    // Map country codes to currencies
    if (countryCode === 'gb') return 'gbp';
    if (['us', 'ca', 'au', 'nz'].includes(countryCode)) return 'usd';
    if (['de', 'fr', 'it', 'es', 'nl', 'be', 'at', 'ie', 'pt', 'fi', 'lu'].includes(countryCode)) return 'eur';
    
    // Default to GBP
    return 'gbp';
  } catch (error) {
    console.warn('Currency detection failed, defaulting to GBP:', error);
    return 'gbp';
  }
}

export function setUserCurrency(currency: Currency): void {
  localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}

export function getCurrencyInfo(currency: Currency): CurrencyInfo {
  return CURRENCIES[currency];
}
