// ============================================================================
// Type Definitions — City
// ============================================================================

export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  costIndex: number;
  popularityScore: number;
  latitude: number;
  longitude: number;
  timezone: string;
  imageUrl: string | null;
}
