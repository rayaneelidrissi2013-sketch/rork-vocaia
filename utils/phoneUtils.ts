export const countryCodeMap: { [key: string]: string } = {
  '+1': 'États-Unis / Canada',
  '+33': 'France',
  '+32': 'Belgique',
  '+41': 'Suisse',
  '+44': 'Royaume-Uni',
  '+49': 'Allemagne',
  '+34': 'Espagne',
  '+39': 'Italie',
  '+351': 'Portugal',
  '+31': 'Pays-Bas',
  '+212': 'Maroc',
  '+213': 'Algérie',
  '+216': 'Tunisie',
  '+225': 'Côte d\'Ivoire',
  '+237': 'Cameroun',
  '+221': 'Sénégal',
  '+243': 'RD Congo',
  '+86': 'Chine',
  '+81': 'Japon',
  '+82': 'Corée du Sud',
  '+91': 'Inde',
  '+971': 'Émirats Arabes Unis',
  '+966': 'Arabie Saoudite',
  '+20': 'Égypte',
  '+27': 'Afrique du Sud',
  '+55': 'Brésil',
  '+52': 'Mexique',
  '+54': 'Argentine',
  '+56': 'Chili',
  '+57': 'Colombie',
  '+61': 'Australie',
  '+64': 'Nouvelle-Zélande',
};

export function detectCountryFromPhone(phoneNumber: string): {
  country: string;
  countryCode: string;
} | null {
  const cleanNumber = phoneNumber.replace(/\s+/g, '');
  
  const sortedCodes = Object.keys(countryCodeMap).sort((a, b) => b.length - a.length);
  
  for (const code of sortedCodes) {
    if (cleanNumber.startsWith(code)) {
      return {
        country: countryCodeMap[code],
        countryCode: code,
      };
    }
  }
  
  return null;
}

export function formatPhoneNumber(phoneNumber: string): string {
  const cleanNumber = phoneNumber.replace(/\s+/g, '');
  
  if (cleanNumber.startsWith('+33')) {
    return cleanNumber.replace(/(\+33)(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
  }
  
  if (cleanNumber.startsWith('+1')) {
    return cleanNumber.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
  }
  
  return phoneNumber;
}

export function validatePhoneNumber(phoneNumber: string, countryCode: string): {
  valid: boolean;
  error?: string;
} {
  const cleanNumber = phoneNumber.replace(/[\s\-\.\(\)]/g, '');
  const digitCount = cleanNumber.length;

  if (!/^[0-9]+$/.test(cleanNumber)) {
    return {
      valid: false,
      error: 'Le numéro ne doit contenir que des chiffres',
    };
  }

  if (digitCount < 6 || digitCount > 15) {
    return {
      valid: false,
      error: `Le numéro doit contenir entre 6 et 15 chiffres (${digitCount} chiffres détectés)`,
    };
  }

  if (countryCode === '+33') {
    if (digitCount !== 9) {
      return {
        valid: false,
        error: `Le numéro français doit contenir 9 chiffres (${digitCount} détectés). Format attendu : 6 XX XX XX XX ou 7 XX XX XX XX`,
      };
    }
    if (!cleanNumber.match(/^[67]/)) {
      return {
        valid: false,
        error: 'Le numéro français doit commencer par 6 ou 7',
      };
    }
  }

  if (countryCode === '+1') {
    if (digitCount !== 10) {
      return {
        valid: false,
        error: `Le numéro américain/canadien doit contenir 10 chiffres (${digitCount} détectés)`,
      };
    }
  }

  if (countryCode === '+212') {
    if (digitCount !== 9) {
      return {
        valid: false,
        error: `Le numéro marocain doit contenir 9 chiffres (${digitCount} détectés)`,
      };
    }
    if (!cleanNumber.match(/^[567]/)) {
      return {
        valid: false,
        error: 'Le numéro marocain doit commencer par 5, 6 ou 7',
      };
    }
  }

  return { valid: true };
}
