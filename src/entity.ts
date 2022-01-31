import { AnyObject } from './utils';
import { Entity } from '@rest-hooks/endpoint';

export type EntitySchema = {
  [k: string]: typeof SupabaseEntity | typeof SupabaseEntity[];
};

type SchemaData<S extends EntitySchema> = {
  [P in keyof S]: S[P] extends typeof SupabaseEntity
    ? EntityData<S[P]>
    : S[P] extends typeof SupabaseEntity[]
    ? EntityData<S[P][number]>[]
    : never;
};

export type EntityData<
  E extends typeof SupabaseEntity,
  AD = E['attributes'],
  SD = SchemaData<E['schema']>
> = SD extends { [k: string]: never } ? AD : AD & SD;

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
