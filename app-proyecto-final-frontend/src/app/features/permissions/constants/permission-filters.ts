/* Maps the raw catalog values to dropdown options*/
export function toFilterOptions(values: string[]): { label: string; value: string }[] {
    return [
        { label: 'Todos', value: '' },
        ...values.map(value => ({ label: value, value }))
    ];
}