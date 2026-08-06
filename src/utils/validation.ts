export const MOROCCAN_PHONE_REGEX = /^(?:0[67]\d{8}|\+212[67]\d{8})$/

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizePhone(value: string): string {
  return value.replace(/[\s()\-]/g, '')
}

export function isValidPhone(value: string): boolean {
  return MOROCCAN_PHONE_REGEX.test(normalizePhone(value))
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function withoutDigits(value: string): string {
  return value.replace(/\d/g, '')
}

export function sanitizePhoneInput(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, '')

  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1).replace(/\D/g, '')
    return `+${digits.slice(0, 12)}`
  }

  const digits = cleaned.replace(/\D/g, '')
  return digits.slice(0, 10)
}

export function getEmailError(value: string): string | null {
  if (!value.trim()) return "L'email est obligatoire"
  if (!isValidEmail(value)) return 'Adresse email invalide'
  return null
}

export function getPhoneError(value: string): string | null {
  if (!value.trim()) return 'Le numero de telephone est obligatoire'
  if (!isValidPhone(value)) {
    return 'Numero marocain invalide (06/07XXXXXXXX ou +2126/7XXXXXXXX)'
  }
  return null
}
