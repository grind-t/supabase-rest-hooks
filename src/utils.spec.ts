import { camelCase, camelKeys, snakeCase, snakeKeys } from './utils';
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

test('camelKeys', () => {
  const snakeObj = {
    snake_case: true,
  };
  const camelObj = {
    snakeCase: true,
  };
  const snakeArr = [snakeObj, snakeObj];
  const camelArr = [camelObj, camelObj];
  const snakeNested = {
    snake_obj: snakeObj,
    snake_arr: snakeArr,
    snake_val: true,
  };
  const camelNested = {
    snakeObj: camelObj,
    snakeArr: camelArr,
    snakeVal: true,
  };

  expect(camelKeys(snakeObj)).toEqual(camelObj);
  expect(camelKeys(snakeArr)).toEqual(camelArr);
  expect(camelKeys(snakeNested)).toEqual(camelNested);
});

test('snakeKeys', () => {
  const camelObj = {
    camelCase: true,
  };
  const snakeObj = {
    camel_case: true,
  };
  const camelArr = [camelObj, camelObj];
  const snakeArr = [snakeObj, snakeObj];
  const camelNested = {
    camelObj,
    camelArr,
    camelVal: true,
  };
  const snakeNested = {
    camel_obj: snakeObj,
    camel_arr: snakeArr,
    camel_val: true,
  };

  expect(snakeKeys(camelObj)).toEqual(snakeObj);
  expect(snakeKeys(camelArr)).toEqual(snakeArr);
  expect(snakeKeys(camelNested)).toEqual(snakeNested);
});
