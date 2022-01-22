import { SupabaseEntity } from './entity';
import { snakeCase } from './utils';
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
  readonly id: number = 0;
  readonly title: string = '';
  readonly completed: boolean = false;
  readonly userId: number = 0;

  pk() {
    return `${this.id}`;
  }

  static table = 'todos';
}

class UserEntity extends SupabaseEntity {
  readonly id = 0;
  readonly name = '';
  readonly todos: TodoEntity[] = [];

  pk() {
    return `${this.id}`;
  }

  static table = 'users';
  static schema = { todos: [TodoEntity] };

  static list = new Endpoint(
    async () => {
      const { data, error } = await this.client
        .from(this.table)
        .select(this.getColumns(snakeCase));
      if (error) throw new Error(error.message);
      return data;
    },
    { schema: [this] }
  );
}

test('get all columns', () => {
  const actual = UserEntity.getColumns();
  const expected = 'id,name,todos:todos(id,title,completed,userId)';
  expect(actual).toBe(expected);
});

test('get columns with different case', () => {
  const actual = TodoEntity.getColumns(snakeCase);
  const expected = 'id:id,title:title,completed:completed,userId:user_id';
  expect(actual).toBe(expected);
});

test('list endpoint', async () => {
  const renderHook = makeRenderRestHook(makeCacheProvider);
  const { result, waitForNextUpdate } = renderHook(() =>
    useResource(UserEntity.list, {})
  );
  await waitForNextUpdate();
  expect(result.current.length).toBeGreaterThan(0);
});
