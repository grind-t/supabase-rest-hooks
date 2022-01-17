import { SupabaseEntity } from './index';
import { test, expect } from '@jest/globals';
import { useResource } from '@rest-hooks/core';
import { Endpoint } from '@rest-hooks/endpoint';
import { makeRenderRestHook, makeCacheProvider } from '@rest-hooks/test';
import { createClient } from '@supabase/supabase-js';

SupabaseEntity.client = createClient(
  'https://byyvykplykpbjpnefvke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQyNDM3NjIwLCJleHAiOjE5NTgwMTM2MjB9.QADxCWc94qM5covHkYAg5yDuC7R3JrssIaZLMCxgBGc'
);

class TodoEntity extends SupabaseEntity {
  readonly id = 0;
  readonly title = '';
  readonly completed = false;

  static table = 'todos';

  static list = new Endpoint(
    async () => {
      const client = this.getClient();
      const columns = this.getColumns();
      const { data, error } = await client.from(this.table).select(columns);
      if (error) throw new Error(error.message);
      return data;
    },
    { schema: [this] }
  );

  pk() {
    return `${this.id}`;
  }
}

test('list endpoint', async () => {
  const renderHook = makeRenderRestHook(makeCacheProvider);
  const { result, waitForNextUpdate } = renderHook(() =>
    useResource(TodoEntity.list, {})
  );
  await waitForNextUpdate();
  expect(result.current.length).toBeGreaterThan(0);
});
