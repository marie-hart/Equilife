import { reactive } from "vue";
import type { FilterDefinition } from "@/types/filters";

type ExtractValue<F> = F extends { type: "select"; defaultValue: infer V }
    ? V
    : string;

type FilterValues<Defs extends readonly FilterDefinition[]> = {
    [K in Defs[number] as K["key"]]: ExtractValue<K>;
};

export function useFilters<Defs extends readonly FilterDefinition[]>(
    definitions: Defs,
) {
    const defs = definitions;
    const values = reactive(
        Object.fromEntries(defs.map((f) => [f.key, f.defaultValue])),
    ) as FilterValues<Defs>;

    const reset = () => {
        defs.forEach((f) => {
            values[f.key as keyof typeof values] = f.defaultValue as any;
        });
    };

    return {
        filterDefinitions: defs,
        filterValues: values,
        resetFilters: reset,
    };
}
