import { Entity } from '@rest-hooks/endpoint';
import { SupabaseClient } from '@supabase/supabase-js';

type DerivedEntity = (new () => SupabaseEntity) & typeof SupabaseEntity;

export abstract class SupabaseEntity extends Entity {
  static client: SupabaseClient;
  static instance: SupabaseEntity;
  static table: string;
  static columns: string;

  static getClient() {
    if (!this.client) throw new Error('missing supabase client');
    return this.client;
  }

  static getInstance(this: DerivedEntity) {
    if (this.instance) return this.instance;
    this.instance = new this();
    return this.instance;
  }

  static getColumns(this: DerivedEntity) {
    if (this.columns) return this.columns;
    const instance = this.getInstance();
    const keys = Object.keys(instance);
    this.columns = keys.join(',');
    return this.columns;
  }
}
