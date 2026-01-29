export type FilterType = "select" | "date" | "search";

export type SelectOption<T extends string> = {
    title: string;
    value: T;
};

export type BaseFilter<TValue> = {
    key: string;
    label: string;
    defaultValue: TValue;
};

export type SelectFilter<TValue = string> = BaseFilter<TValue> & {
    type: "select";
    options: { title: string; value: TValue }[];
};

export type DateFilter = BaseFilter<string> & {
    type: "date";
};

export type SearchFilter = BaseFilter<string> & {
    type: "search";
};

export type FilterDefinition<TValue = any> =
    | SelectFilter<TValue>
    | DateFilter
    | SearchFilter;
