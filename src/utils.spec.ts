import { camelCase, camelKeys, snakeCase, snakeKeys } from './utils';
import { test, expect } from '@jest/globals';

test('case conversion', () => {
  const snake = ['simple', 'really_long_and_complex'];
  const camel = ['simple', 'reallyLongAndComplex'];

  expect(snake.every((v, i) => camelCase(v) === camel[i])).toBe(true);
  expect(camel.every((v, i) => snakeCase(v) === snake[i])).toBe(true);
});

test('keys conversion', () => {
  const snakeObj = {
    simple: true,
    really_long_and_complex: true,
  };
  const camelObj = {
    simple: true,
    reallyLongAndComplex: true,
  };
  const snakeArr = [snakeObj, snakeObj];
  const camelArr = [camelObj, camelObj];
  const snakeNested = {
    nested_obj: snakeObj,
    nested_arr: snakeArr,
    simple: true,
  };
  const camelNested = {
    nestedObj: camelObj,
    nestedArr: camelArr,
    simple: true,
  };

  expect(camelKeys(snakeObj)).toEqual(camelObj);
  expect(snakeKeys(camelObj)).toEqual(snakeObj);
  expect(camelKeys(snakeArr)).toEqual(camelArr);
  expect(snakeKeys(camelArr)).toEqual(snakeArr);
  expect(camelKeys(snakeNested)).toEqual(camelNested);
  expect(snakeKeys(camelNested)).toEqual(snakeNested);
});
