const ADJECTIVES = [
  'Silent',
  'Clever',
  'Observant',
  'Quick',
  'Curious',
  'Sharp',
  'Bold',
  'Mystic',
  'Quiet',
  'Sleek',
  'Noble',
  'Keen',
  'Witty',
  'Brave',
  'Calm',
  'Vigilant',
];

const ANIMALS = [
  'Tiger',
  'Falcon',
  'Hawk',
  'Leopard',
  'Fox',
  'Wolf',
  'Owl',
  'Panther',
  'Eagle',
  'Otter',
  'Cheetah',
  'Badger',
  'Jaguar',
  'Lynx',
  'Falcon',
  'Raven',
];

const PROHIBITED_WORDS = [
  'admin',
  'moderator',
  'police_official',
  'chor_official',
  'system',
  'staff',
  'abuse',
  'idiot',
  'stupid',
  'cheat',
  'hacker',
  'bot',
];

export function generateRandomAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}

export function validateAlias(input: string): { isValid: boolean; error?: string; sanitized?: string } {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Alias cannot be empty.' };
  }

  const trimmed = input.trim().replace(/\s+/g, ' ');

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Alias must be at least 3 characters long.' };
  }

  if (trimmed.length > 16) {
    return { isValid: false, error: 'Alias cannot exceed 16 characters.' };
  }

  const regex = /^[a-zA-Z0-9 ]+$/;
  if (!regex.test(trimmed)) {
    return { isValid: false, error: 'Alias can only contain letters, numbers, and spaces.' };
  }

  const lower = trimmed.toLowerCase();
  for (const badWord of PROHIBITED_WORDS) {
    if (lower.includes(badWord)) {
      return { isValid: false, error: 'Alias contains reserved or prohibited terms.' };
    }
  }

  return { isValid: true, sanitized: trimmed };
}
