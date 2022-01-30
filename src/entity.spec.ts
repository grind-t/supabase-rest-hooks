/* eslint-disable @typescript-eslint/no-empty-interface */
import { SupabaseEntity, EntityData, getColumns } from './entity';
import { pick, snakeCase } from './utils';
import { test, expect } from '@jest/globals';
import { useResource } from '@rest-hooks/core';
import { Endpoint } from '@rest-hooks/endpoint';
import { makeRenderRestHook, makeCacheProvider } from '@rest-hooks/test';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://byyvykplykpbjpnefvke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQyNDM3NjIwLCJleHAiOjE5NTgwMTM2MjB9.QADxCWc94qM5covHkYAg5yDuC7R3JrssIaZLMCxgBGc'
);

class TodoEntity extends SupabaseEntity {
  id!: number;

  pk() {
    return `${this.id}`;
  }

  static table = 'todos';
}

class UserEntity extends SupabaseEntity {
  id!: number;

  pk() {
    return `${this.id}`;
  }

  static table = 'users';
}

const todoAttributes = {
  id: 0,
  userId: 0,
  title: '',
  completed: false,
};

const userAttributes = {
  id: 0,
  name: '',
};

class Todo extends TodoEntity {
  static attributes = pick(todoAttributes, ['id', 'userId']);
  static schema = {
    user: class extends UserEntity {
      static attributes = pick(userAttributes, ['id']);
    },
  };
}

type TodoData = EntityData<typeof Todo>;

interface Todo extends TodoData {}

class User extends UserEntity {
  static attributes = pick(userAttributes, ['id']);
  static schema = {
    todos: [Todo],
  };
}

type UserData = EntityData<typeof User>;

interface User extends UserData {}

const getUser = new Endpoint(
  async () => {
    const { data, error } = await supabase
      .from<UserData>(User.table)
      .select(getColumns(User, snakeCase));
    if (error) throw new Error(error.message);
    return data;
  },
  { schema: [User] }
);

test('get all columns', () => {
  const actual = getColumns(User);
  const expected = 'id,todos:todos(id,userId,user:users(id))';
  expect(actual).toBe(expected);
});

test('get columns with different case', () => {
  const actual = getColumns(Todo, snakeCase);
  const expected = 'id:id,userId:user_id,user:users(id:id)';
  expect(actual).toBe(expected);
});

test('list endpoint', async () => {
  const renderHook = makeRenderRestHook(makeCacheProvider);
  const { result, waitForNextUpdate } = renderHook(() =>
    useResource(getUser, {})
  );
  await waitForNextUpdate();
  expect(result.current.length).toBeGreaterThan(0);
});
