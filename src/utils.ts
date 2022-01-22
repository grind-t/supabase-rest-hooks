/* eslint-disable @typescript-eslint/no-explicit-any */

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

function mapKeys(value: any, callback: (key: string) => string): any {
  if (Array.isArray(value)) return value.map((v) => mapKeys(v, callback));
  if (typeof value !== 'object') return value;
  return Object.entries(value).reduce((acc, [key, value]) => {
    acc[callback(key)] = mapKeys(value, callback);
    return acc;
  }, {} as Record<string, any>);
}

export function camelKeys(value: any): any {
  return mapKeys(value, camelCase);
}

export function snakeKeys(value: any): any {
  return mapKeys(value, snakeCase);
}

/*export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

type DeepSchema<T extends typeof SupabaseEntity> = {
  [P in keyof InstanceType<T>]: InstanceType<T>[P];
} & {
  [P in keyof T['schema']]: DeepSchema<
    T['schema'][P] extends any[]
      ? T['schema'][P][number] extends typeof SupabaseEntity
        ? T['schema'][P][number]
        : never
      : T['schema'][P] extends typeof SupabaseEntity
      ? T['schema'][P]
      : never
  >;
};*/
