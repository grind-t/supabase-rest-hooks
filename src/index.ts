import { DeepPartial } from './utils';
import { Entity } from '@rest-hooks/endpoint';
import { SupabaseClient } from '@supabase/supabase-js';

type DerivedEntity = (new () => SupabaseEntity) & typeof SupabaseEntity;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const include: any = Symbol('include column');

export abstract class SupabaseEntity extends Entity {
  static client: SupabaseClient;
  static table: string;

  static get key(): string {
    return this.table;
  }

  static getColumns<T extends DerivedEntity>(
    this: T,
    instance?: DeepPartial<InstanceType<T>>,
    dbKey?: (key: string) => string
  ): string {
    const columns = [];
    for (const [key, value] of Object.entries(instance || this.fromJS())) {
      if (typeof value === 'function') continue;
      if (key in this.schema) {
        const nestedEntity = this.schema[key] as DerivedEntity;
        const nestedColumns = nestedEntity.getColumns(value);
        columns.push(`${key}:${nestedEntity.table}(${nestedColumns})`);
        continue;
      }
      columns.push(dbKey ? `${key}:${dbKey(key)}` : key);
    }
    return columns.join(',');
  }
}
