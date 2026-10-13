/**
 * Countries Dataset & Live IP Geolocation API Helper
 * Men Are Brave - Auth Regional Code Resolution
 */

export const COUNTRIES = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', placeholder: '98765 43210' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', placeholder: '(555) 000-0000' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', placeholder: '(555) 000-0000' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦', placeholder: '50 123 4567' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬', placeholder: '8123 4567' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', placeholder: '151 12345678' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵', placeholder: '90 1234 5678' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺', placeholder: '912 345-67-89' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷', placeholder: '11 91234-5678' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: '🇳🇵', placeholder: '984 1234567' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩', placeholder: '1712-345678' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰', placeholder: '300 1234567' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: '🇱🇰', placeholder: '71 234 5678' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦', placeholder: '3312 3456' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼', placeholder: '5123 4567' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲', placeholder: '9123 4567' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭', placeholder: '3612 3456' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿', placeholder: '21 123 4567' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦', placeholder: '71 123 4567' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬', placeholder: '802 123 4567' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪', placeholder: '712 345678' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾', placeholder: '12-345 6789' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩', placeholder: '812-3456-7890' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭', placeholder: '917 123 4567' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭', placeholder: '81 234 5678' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳', placeholder: '91 234 5678' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷', placeholder: '10-1234-5678' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹', placeholder: '312 345 6789' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱', placeholder: '6 12345678' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭', placeholder: '78 123 45 67' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪', placeholder: '70-123 45 67' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴', placeholder: '412 34 567' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: '🇩🇰', placeholder: '20 12 34 56' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮', placeholder: '40 1234567' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: '🇵🇱', placeholder: '512 345 678' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪', placeholder: '85 123 4567' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪', placeholder: '470 12 34 56' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: '🇦🇹', placeholder: '664 1234567' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹', placeholder: '912 345 678' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: '🇬🇷', placeholder: '691 234 5678' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷', placeholder: '501 234 56 78' },
  { name: 'Israel', code: 'IL', dialCode: '+972', flag: '🇮🇱', placeholder: '50-123-4567' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬', placeholder: '10 1234 5678' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷', placeholder: '9 11 1234-5678' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴', placeholder: '300 123 4567' },
  { name: 'Chile', code: 'CL', dialCode: '+56', flag: '🇨🇱', placeholder: '9 1234 5678' },
  { name: 'Peru', code: 'PE', dialCode: '+51', flag: '🇵🇪', placeholder: '912 345 678' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380', flag: '🇺🇦', placeholder: '50 123 4567' },
  { name: 'Czech Republic', code: 'CZ', dialCode: '+420', flag: '🇨🇿', placeholder: '601 123 456' },
  { name: 'Romania', code: 'RO', dialCode: '+40', flag: '🇷🇴', placeholder: '712 345 678' },
  { name: 'Hungary', code: 'HU', dialCode: '+36', flag: '🇭🇺', placeholder: '20 123 4567' },
  { name: 'Afghanistan', code: 'AF', dialCode: '+93', flag: '🇦🇫', placeholder: '70 123 4567' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213', flag: '🇩🇿', placeholder: '551 23 45 67' },
  { name: 'Armenia', code: 'AM', dialCode: '+374', flag: '🇦🇲', placeholder: '77 123456' },
  { name: 'Azerbaijan', code: 'AZ', dialCode: '+994', flag: '🇦🇿', placeholder: '50 123 45 67' },
  { name: 'Bhutan', code: 'BT', dialCode: '+975', flag: '🇧🇹', placeholder: '17 12 34 56' },
  { name: 'Cyprus', code: 'CY', dialCode: '+357', flag: '🇨🇾', placeholder: '96 123456' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251', flag: '🇪🇹', placeholder: '91 123 4567' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭', placeholder: '24 123 4567' },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852', flag: '🇭🇰', placeholder: '5123 4567' },
  { name: 'Iceland', code: 'IS', dialCode: '+354', flag: '🇮🇸', placeholder: '612 3456' },
  { name: 'Iraq', code: 'IQ', dialCode: '+964', flag: '🇮🇶', placeholder: '790 123 4567' },
  { name: 'Jordan', code: 'JO', dialCode: '+962', flag: '🇯🇴', placeholder: '7 9012 3456' },
  { name: 'Kazakhstan', code: 'KZ', dialCode: '+7', flag: '🇰🇿', placeholder: '701 123 4567' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961', flag: '🇱🇧', placeholder: '71 123 456' },
  { name: 'Luxembourg', code: 'LU', dialCode: '+352', flag: '🇱🇺', placeholder: '621 123 456' },
  { name: 'Maldives', code: 'MV', dialCode: '+960', flag: '🇲🇻', placeholder: '771 2345' },
  { name: 'Mauritius', code: 'MU', dialCode: '+230', flag: '🇲🇺', placeholder: '5251 2345' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦', placeholder: '612 345678' },
  { name: 'Myanmar', code: 'MM', dialCode: '+95', flag: '🇲🇲', placeholder: '9 251 234 567' },
  { name: 'Panama', code: 'PA', dialCode: '+507', flag: '🇵🇦', placeholder: '6123 4567' },
  { name: 'Serbia', code: 'RS', dialCode: '+381', flag: '🇷🇸', placeholder: '60 1234567' },
  { name: 'Taiwan', code: 'TW', dialCode: '+886', flag: '🇹🇼', placeholder: '912 345 678' },
  { name: 'Uganda', code: 'UG', dialCode: '+256', flag: '🇺🇬', placeholder: '712 345678' },
  { name: 'Uzbekistan', code: 'UZ', dialCode: '+998', flag: '🇺🇿', placeholder: '90 123 45 67' },
  { name: 'Zimbabwe', code: 'ZW', dialCode: '+263', flag: '🇿🇼', placeholder: '71 234 5678' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // India (+91)

/**
 * Normalizes user-typed dial code string (e.g. "91" -> "+91", "++91" -> "+91")
 */
export const normalizeDialCode = (val) => {
  if (!val) return '+';
  const clean = val.replace(/[^0-9]/g, '');
  return clean ? `+${clean}` : '+';
};

/**
 * Find country by dial code with prioritization
 */
export const findCountryByDialCode = (dialCode) => {
  if (!dialCode) return DEFAULT_COUNTRY;
  const normalized = normalizeDialCode(dialCode);
  if (normalized === '+') return null;

  // Exact match
  const matches = COUNTRIES.filter((c) => c.dialCode === normalized);
  if (matches.length > 0) {
    if (normalized === '+1') {
      return matches.find((c) => c.code === 'US') || matches[0];
    }
    if (normalized === '+7') {
      return matches.find((c) => c.code === 'RU') || matches[0];
    }
    return matches[0];
  }

  // Prefix fallback: user typed e.g. "+9" while typing "+91"
  const prefixMatch = COUNTRIES.find((c) => c.dialCode.startsWith(normalized));
  return prefixMatch || null;
};

/**
 * Search countries by query (Name, Dial Code, ISO Code)
 */
export const searchCountries = (query) => {
  if (!query || !query.trim()) return COUNTRIES;
  const q = query.trim().toLowerCase();
  const cleanQ = q.replace(/[^0-9]/g, '');

  return COUNTRIES.filter((c) => {
    const matchName = c.name.toLowerCase().includes(q);
    const matchCode = c.code.toLowerCase() === q;
    const matchDial = c.dialCode.toLowerCase().includes(q);
    const matchDialNum = cleanQ && c.dialCode.replace(/[^0-9]/g, '').startsWith(cleanQ);
    return matchName || matchCode || matchDial || matchDialNum;
  });
};

// In-memory cache for detected country
let cachedDetectedCountry = null;

/**
 * Detect User Country via IP Geolocation API with fast failover and timeout
 */
export const detectUserCountry = async () => {
  if (cachedDetectedCountry) {
    return cachedDetectedCountry;
  }

  // List of fast, free CORS-enabled IP Geolocation endpoints
  const endpoints = [
    {
      url: 'https://ipapi.co/json/',
      extractCode: (data) => data.country_code || data.country,
    },
    {
      url: 'https://api.country.is/',
      extractCode: (data) => data.country,
    },
    {
      url: 'https://ipwho.is/',
      extractCode: (data) => data.country_code,
    },
  ];

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2200);

      const res = await fetch(ep.url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const detectedIso = ep.extractCode(json);
        if (detectedIso && typeof detectedIso === 'string') {
          const match = COUNTRIES.find(
            (c) => c.code.toUpperCase() === detectedIso.toUpperCase()
          );
          if (match) {
            cachedDetectedCountry = match;
            return match;
          }
        }
      }
    } catch {
      // Continue to next endpoint if this one timed out or failed
      continue;
    }
  }

  // Default fallback if all fail or offline
  return DEFAULT_COUNTRY;
};
