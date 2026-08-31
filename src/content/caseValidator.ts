import type { Case } from '../types';

export function validateCase(value: unknown): { valid: boolean; errors: string[]; caseData?: Case } {
  const errors: string[] = [];
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return { valid: false, errors: ['Case must be an object.'] };
  const item = value as Record<string, unknown>;
  for (const field of ['id', 'title', 'intro', 'location', 'correctReasoning'])
    if (typeof item[field] !== 'string' || !(item[field] as string).trim())
      errors.push(`${field} is required.`);
  if (!Array.isArray(item.publicEvidence) || item.publicEvidence.length < 2)
    errors.push('At least two public evidence items are required.');
  if (!item.roleClues || typeof item.roleClues !== 'object') errors.push('Role clues are required.');
  if (!Array.isArray(item.predefinedQuestions) || !item.predefinedQuestions.length)
    errors.push('At least one structured question is required.');
  if (!['Easy', 'Medium', 'Hard'].includes(String(item.difficulty)))
    errors.push('Difficulty must be Easy, Medium, or Hard.');
  return errors.length ? { valid: false, errors } : { valid: true, errors, caseData: value as Case };
}
