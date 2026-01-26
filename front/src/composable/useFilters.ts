import { reactive } from 'vue'
import type { FilterDefinition } from '@/types/filters'

type ExtractValue<F> =
  F extends { type: 'select'; defaultValue: infer V }
    ? V
    : string

type FilterValues<Defs extends readonly FilterDefinition[]> = {
  [K in Defs[number] as K['key']]: ExtractValue<K>
}

export function useFilters<const Defs extends readonly FilterDefinition[]>(
  definitions: Defs
) {
  const values = reactive(
    Object.fromEntries(
      definitions.map((f) => [f.key, f.defaultValue])
    )
  ) as FilterValues<Defs>

  const reset = () => {
    definitions.forEach((f) => {
      values[f.key] = f.defaultValue as any
    })
  }

  return {
    filterDefinitions: definitions,
    filterValues: values,
    resetFilters: reset,
  }
}
