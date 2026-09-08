/**
 * Configuration for initializing the Google Maps client.
 *
 * @property apiKey - Google Maps API key used to authenticate requests.
 * @property libraries - Optional list of Google Maps libraries to load.
 * @property language - Optional language locale used by the Maps API.
 * @property region - Optional region code used by the Maps API.
 */
export type GoogleMapsConfig = {
  apiKey: string;
  libraries?: string[];
  language?: string;
  region?: string;
};
