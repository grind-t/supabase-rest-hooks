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
