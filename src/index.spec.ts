import { SupabaseEntity, include } from './index';
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

class UserEntity extends SupabaseEntity {
  readonly id = 0;
  readonly name = '';

  static table = 'users';

  pk() {
    return `${this.id}`;
  }
}

class TodoEntity extends SupabaseEntity {
  readonly id: number = 0;
  readonly title: string = '';
  readonly completed: boolean = false;
  readonly userId: number = 0;
  readonly user: UserEntity = UserEntity.fromJS({});

  static table = 'todos';

  static schema = { user: UserEntity };

  static list = new Endpoint(
    async () => {
      const { data, error } = await this.client
        .from(this.table)
        .select(this.getColumns(this.fromJS(), snakeCase));
      if (error) throw new Error(error.message);
      return data;
    },
    { schema: [this] }
  );

  pk() {
    return `${this.id}`;
  }
}

test('get all columns', () => {
  const actual = TodoEntity.getColumns();
  const expected = 'id,title,completed,userId,user:users(id,name)';
  expect(actual).toBe(expected);
});

test('get partial columns', () => {
  const actual = TodoEntity.getColumns({
    id: include,
    user: {
      id: include,
    },
  });
  const expected = 'id,user:users(id)';
  expect(actual).toBe(expected);
});

test('get columns with different case', () => {
  const actual = TodoEntity.getColumns(
    { id: undefined, userId: undefined },
    snakeCase
  );
  const expected = 'id:id,userId:user_id';
  expect(actual).toBe(expected);
});

test('list endpoint', async () => {
  const renderHook = makeRenderRestHook(makeCacheProvider);
  const { result, waitForNextUpdate } = renderHook(() =>
    useResource(TodoEntity.list, {})
  );
  await waitForNextUpdate();
  expect(result.current.length).toBeGreaterThan(0);
});
