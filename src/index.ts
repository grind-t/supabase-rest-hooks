import { DeepPartial } from './utils';
import { Entity } from '@rest-hooks/endpoint';
import { SupabaseClient } from '@supabase/supabase-js';

type DerivedEntity = (new () => SupabaseEntity) & typeof SupabaseEntity;

export const includeColumn = undefined;

export abstract class SupabaseEntity extends Entity {
  static client: SupabaseClient;
  static table: string;

  static get key(): string {
    return this.table;
  }

  static getColumns<T extends DerivedEntity>(
    this: T,
    instance?: DeepPartial<InstanceType<T>>
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
      columns.push(`${key}`);
    }
    return columns.join(',');
  }
}
