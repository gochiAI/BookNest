export interface FilterOption {
    value: string;
    label: string;
}

export interface Filter {
    id: string;
    label: string;
    type: string;
    options?: FilterOption[];
    placeholder?: string;
}