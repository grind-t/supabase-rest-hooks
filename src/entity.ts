import { Constructor } from './utils';
import { Entity, isEntity } from '@rest-hooks/endpoint';
import { SupabaseClient } from '@supabase/supabase-js';

export type DerivableEntityClass = Constructor<SupabaseEntity> &
  Pick<typeof SupabaseEntity, 'fullSchema'>;

export type DerivedEntity<S> = {
  readonly [P in keyof S]: S[P] extends any[]
    ? S[P][number] extends Constructor<SupabaseEntity>
      ? InstanceType<S[P][number]>[]
      : S[P]
    : S[P] extends Constructor<SupabaseEntity>
    ? InstanceType<S[P]>
    : S[P];
} & SupabaseEntity;

export type Attributes<S> = Pick<
  S,
  {
    [P in keyof S]: S[P] extends any[]
      ? S[P][number] extends Constructor<SupabaseEntity>
        ? never
        : P
      : S[P] extends Constructor<SupabaseEntity>
      ? never
      : P;
  }[keyof S]
>;

export type Insert<T extends DerivableEntityClass> = Attributes<
  T['fullSchema']
>;

export type Update<T extends typeof SupabaseEntity> = Partial<Insert<T>>;

export function isSupabaseEntity(value: any): value is typeof SupabaseEntity {
  return value !== undefined && value.getColumns !== undefined;
}

export abstract class SupabaseEntity extends Entity {
  static client: SupabaseClient;
  static table: string;
  static fullSchema: { [k: string]: any };

  static get key(): string {
    return this.table;
  }

  static getColumns<T extends typeof SupabaseEntity>(
    this: T,
    dbKey?: (entityKey: string) => string
  ): string {
    const columns = [];
    for (const [key, value] of Object.entries(this.fullSchema)) {
      const elem = Array.isArray(value) ? value[0] : value;
      if (isSupabaseEntity(elem)) {
        const nestedColumns = elem.getColumns(dbKey);
        columns.push(`${key}:${elem.table}(${nestedColumns})`);
      } else columns.push(dbKey ? `${key}:${dbKey(key)}` : key);
    }
    return columns.join(',');
  }

  static derive<
    T extends DerivableEntityClass,
    S extends Partial<T['fullSchema']>
  >(this: T, derivedSchema: S) {
    const fields = {} as any;
    const schema = {} as any;
    for (const [key, value] of Object.entries(derivedSchema)) {
      if (Array.isArray(value)) {
        const elem = value[0];
        if (isEntity(elem)) {
          fields[key] = [];
          schema[key] = value;
        } else fields[key] = value;
      } else if (isEntity(value)) {
        fields[key] = value.fromJS();
        schema[key] = value;
      } else fields[key] = value;
    }

    const derivedClass = class extends this {
      constructor(...args: any[]) {
        super();
        Object.assign(this, fields);
      }

      static schema = schema;
      static fullSchema = derivedSchema;
    };

    return derivedClass as {
      new (...args: any[]): DerivedEntity<S>;
      prototype: DerivedEntity<S>;
    } & typeof derivedClass;
  }
}
