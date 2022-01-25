import { isSupabaseEntity, SupabaseEntity } from './entity';
import { snakeCase } from './utils';
import { test, expect } from '@jest/globals';
import { useResource } from '@rest-hooks/core';
import { Endpoint } from '@rest-hooks/endpoint';
import { makeRenderRestHook, makeCacheProvider } from '@rest-hooks/test';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://byyvykplykpbjpnefvke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQyNDM3NjIwLCJleHAiOjE5NTgwMTM2MjB9.QADxCWc94qM5covHkYAg5yDuC7R3JrssIaZLMCxgBGc'
);

abstract class TodoEntity extends SupabaseEntity {
  abstract id: number;

  pk() {
    return `${this.id}`;
  }

  static table = 'todos';

  static fullSchema: {
    id: number;
    title: string;
    completed: boolean;
    userId: number;
    user: typeof UserEntity;
  };
}

abstract class UserEntity extends SupabaseEntity {
  abstract id: number;

  pk() {
    return `${this.id}`;
  }

  static table = 'users';

  static fullSchema: {
    id: number;
    name: string;
    todos: typeof TodoEntity[];
  };
}

class Todo extends TodoEntity.derive({
  id: 0,
  userId: 0,
  user: UserEntity.derive({ id: 0 }),
}) {}

class User extends UserEntity.derive({
  id: 0,
  todos: [Todo],
}) {
  static select = new Endpoint(
    async () => {
      const { data, error } = await supabase
        .from(this.table)
        .select(this.getColumns(snakeCase));
      if (error) throw new Error(error.message);
      return data;
    },
    { schema: [this] }
  );
}

test('derive entity', () => {
  expect(Todo.fromJS()).toEqual({ id: 0, userId: 0, user: { id: 0 } });
  expect(User.fromJS()).toEqual({ id: 0, todos: [] });
  expect(isSupabaseEntity(Todo.schema.user)).toBe(true);
  expect(isSupabaseEntity(User.schema.todos[0])).toBe(true);
});

test('get all columns', () => {
  const actual = User.getColumns();
  const expected = 'id,todos:todos(id,userId,user:users(id))';
  expect(actual).toBe(expected);
});

test('get columns with different case', () => {
  const actual = Todo.getColumns(snakeCase);
  const expected = 'id:id,userId:user_id,user:users(id:id)';
  expect(actual).toBe(expected);
});

test('get attributes', () => {
  const todo = Todo.fromJS();
  const user = User.fromJS({ todos: [todo] });
  expect(todo.getAttributes()).toEqual({ id: 0, userId: 0 });
  expect(user.getAttributes()).toEqual({ id: 0 });
});

test('list endpoint', async () => {
  const renderHook = makeRenderRestHook(makeCacheProvider);
  const { result, waitForNextUpdate } = renderHook(() =>
    useResource(User.select, {})
  );
  await waitForNextUpdate();
  expect(result.current.length).toBeGreaterThan(0);
});
