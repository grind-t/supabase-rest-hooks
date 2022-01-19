export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export function camelCase(snakeCase: string): string {
  const regex = /[_][a-z]/gi;
  return snakeCase
    .toLowerCase()
    .replace(regex, (match) => match[1].toUpperCase());
}

export function snakeCase(camelCase: string): string {
  const regex = /[A-Z]/g;
  return camelCase.replace(regex, (match) => '_' + match.toLowerCase());
}
