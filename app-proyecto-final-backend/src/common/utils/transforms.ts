import { TransformFnParams } from "class-transformer";

/*------------UTILITIES------------ */

//Method to trim the text
export const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

//Method to trim the text with lowercase
export const trimLowerCase = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

//Helper method to trim the text with uppercase
export const trimUpperCase = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

//Helper method to transform the uppercase with trimmed text
export const trimUpperCaseEach = ({ value }: TransformFnParams): unknown =>
  Array.isArray(value) ? value.map((v) => (typeof v === 'string' ? v.trim().toUpperCase() : v)) : value;