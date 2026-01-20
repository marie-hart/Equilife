import { validate } from 'vee-validate'
import { required } from '@vee-validate/rules'

type RequiredField = {
  label: string
  value: unknown
}

type RequiredFieldWithKey = RequiredField & {
  key: string
}

const requiredRule = (value: unknown) => (required(value) ? true : 'Champ requis.')

export const validateRequiredFields = async (
  fields: RequiredField[]
): Promise<string | null> => {
  for (const field of fields) {
    const result = await validate(field.value, requiredRule)
    if (!result.valid) {
      return `Merci de renseigner ${field.label}.`
    }
  }
  return null
}

export const validateRequiredFieldsMap = async (
  fields: RequiredFieldWithKey[]
): Promise<{ errors: Record<string, string>; firstError: string | null }> => {
  const errors: Record<string, string> = {}
  for (const field of fields) {
    const result = await validate(field.value, requiredRule)
    if (!result.valid) {
      errors[field.key] = `Merci de renseigner ${field.label}.`
    }
  }
  const firstError = Object.values(errors)[0] ?? null
  return { errors, firstError }
}
