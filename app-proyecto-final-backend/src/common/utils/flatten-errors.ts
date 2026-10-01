import { ValidationError } from '@nestjs/common';

//Principal function helper for the errors detection
export function flattenErrors(
    errors: ValidationError[],
    parent = '',
): Record<string, string> {
    const result: Record<string, string> = {};
    for (const err of errors) {
        const path = parent ? `${parent}.${err.property}` : err.property;
        const first = Object.values(err.constraints ?? {})[0];
        if (first) result[path] = first;
        if (err.children?.length) {
            Object.assign(result, flattenErrors(err.children, path));
        }
    }
    return result;
}