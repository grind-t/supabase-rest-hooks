import { Entity } from '@rest-hooks/endpoint';
import { SupabaseClient } from '@supabase/supabase-js';

export type Insert<T extends typeof SupabaseEntity> = Omit<
  InstanceType<T>,
  keyof T['schema']
>;

export type Update<T extends typeof SupabaseEntity> = Partial<Insert<T>>;

export abstract class SupabaseEntity extends Entity {
  static client: SupabaseClient;
  static table: string;

  static get key(): string {
    return this.table;
  }

  static getColumns<T extends typeof SupabaseEntity>(
    this: T,
    dbKey?: (entityKey: string) => string
  ): string {
    const columns = [];
    for (const key of Object.keys(this.fromJS())) {
      if (key in this.schema) {
        const nestedSchema = this.schema[key];
        const nestedEntity = (
          Array.isArray(nestedSchema) ? nestedSchema[0] : nestedSchema
        ) as typeof SupabaseEntity;
        const nestedColumns = nestedEntity.getColumns(dbKey);
        columns.push(`${key}:${nestedEntity.table}(${nestedColumns})`);
        continue;
      }
      columns.push(dbKey ? `${key}:${dbKey(key)}` : key);
    }
    return columns.join(',');
  }
}
