import { camelCase, snakeCase } from './utils';
import { test, expect } from '@jest/globals';

test('camelCase', () => {
  const snake = ['snake_case', 'SCREAMING_SNAKE_CASE'];
  const camel = ['snakeCase', 'screamingSnakeCase'];

  expect(snake.every((v, i) => camelCase(v) === camel[i])).toBe(true);
});

test('snakeCase', () => {
  const camel = ['lowerCamelCase'];
  const snake = ['lower_camel_case'];

  expect(camel.every((v, i) => snakeCase(v) === snake[i])).toBe(true);
});
