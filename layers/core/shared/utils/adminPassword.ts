export const MIN_ADMIN_PASSWORD_LENGTH = 10

export type PasswordProblem = 'too_short' | 'mismatch'

/** Checked in the browser before the password goes to Supabase Auth. */
export function passwordProblem(password: string, confirmation: string): PasswordProblem | null {
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) return 'too_short'
  if (password !== confirmation) return 'mismatch'
  return null
}

/** The admin is Romanian only; the message for a local check or a Supabase Auth error code. */
export function passwordMessage(problem: PasswordProblem | string | undefined): string {
  switch (problem) {
    case 'too_short':
      return `Parola trebuie să aibă cel puțin ${MIN_ADMIN_PASSWORD_LENGTH} caractere.`
    case 'mismatch':
      return 'Parolele nu coincid.'
    case 'same_password':
      return 'Parola nouă trebuie să difere de cea veche.'
    case 'weak_password':
      return 'Parola e prea slabă sau a apărut într-o scurgere de date. Alege alta.'
    default:
      return 'Nu am putut schimba parola.'
  }
}
