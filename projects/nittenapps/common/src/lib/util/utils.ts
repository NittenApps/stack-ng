/**
 * Converts a snake_case or kebab-case string to camelCase.
 *
 * Example:
 * ```ts
 * snakeToCamel('hello_world'); // 'helloWorld'
 * snakeToCamel('hello-world'); // 'helloWorld'
 * ```
 *
 * @param str The string to convert.
 * @returns The string converted to camelCase.
 */
export const snakeToCamel = (str: string) =>
  str.toLowerCase().replace(/[-_][a-z]/g, (group) => group.slice(-1).toUpperCase());
