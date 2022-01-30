import { AnyObject } from './utils';
import { Entity } from '@rest-hooks/endpoint';

export type EntitySchema = {
  [k: string]: typeof SupabaseEntity | typeof SupabaseEntity[];
};

export type EntityData<E extends typeof SupabaseEntity> = E['attributes'] & {
  [P in keyof E['schema']]: E['schema'][P] extends typeof SupabaseEntity
    ? EntityData<E['schema'][P]>
    : E['schema'][P] extends typeof SupabaseEntity[]
    ? EntityData<E['schema'][P][number]>[]
    : never;
};

export abstract class SupabaseEntity extends Entity {
  static table: string;
  static attributes: AnyObject;
  static schema: EntitySchema;

  static get key(): string {
    return this.table;
  }
}

export function getColumns<
  T extends Pick<typeof SupabaseEntity, 'attributes' | 'schema'>
>(entity: T, dbKey?: (entityKey: string) => string): string {
  const columns = [];
  for (const key of Object.keys(entity.attributes)) {
    columns.push(dbKey ? `${key}:${dbKey(key)}` : key);
  }
  for (const [key, value] of Object.entries(entity.schema)) {
    const entity = Array.isArray(value) ? value[0] : value;
    columns.push(`${key}:${entity.table}(${getColumns(entity, dbKey)})`);
  }
  return columns.join(',');
}
