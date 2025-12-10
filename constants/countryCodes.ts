export interface CountryCode {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Belgique', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
  { name: 'Suisse', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Luxembourg', code: 'LU', dialCode: '+352', flag: '🇱🇺' },
  { name: 'États-Unis', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'Royaume-Uni', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Allemagne', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'Italie', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Espagne', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹' },
  { name: 'Pays-Bas', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Maroc', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
  { name: 'Algérie', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
  { name: 'Tunisie', code: 'TN', dialCode: '+216', flag: '🇹🇳' },
  { name: 'Côte d\u0027Ivoire', code: 'CI', dialCode: '+225', flag: '🇨🇮' },
  { name: 'Sénégal', code: 'SN', dialCode: '+221', flag: '🇸🇳' },
  { name: 'Cameroun', code: 'CM', dialCode: '+237', flag: '🇨🇲' },
];
