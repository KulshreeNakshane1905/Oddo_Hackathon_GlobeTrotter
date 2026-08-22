// ============================================================================
// Constants
// ============================================================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'GlobalTrotters';
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Debounce
export const SEARCH_DEBOUNCE_MS = 300;

// Activity types
export const ACTIVITY_TYPES = [
  'SIGHTSEEING',
  'FOOD',
  'ADVENTURE',
  'CULTURE',
  'NIGHTLIFE',
  'SHOPPING',
  'NATURE',
  'TRANSPORT',
  'OTHER',
] as const;

// Activity type colors (for chips and calendar events)
export const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  SIGHTSEEING: '#6C63FF',
  FOOD: '#FF6B6B',
  ADVENTURE: '#FF9F43',
  CULTURE: '#A855F7',
  NIGHTLIFE: '#EC4899',
  SHOPPING: '#14B8A6',
  NATURE: '#22C55E',
  TRANSPORT: '#3B82F6',
  OTHER: '#94A3B8',
};

// Currency options
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];
