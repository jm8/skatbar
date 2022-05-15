import {getEffectiveSuit} from './index'

test('effective suit', () => {
  expect(getEffectiveSuit('3H', {color: 'red', parity: 'even'})).toBe('H')
  expect(getEffectiveSuit('3H', {color: 'red', parity: 'odd'})).toBe('T')
  expect(getEffectiveSuit('6C', {color: 'red', parity: 'even'})).toBe('C')
  expect(getEffectiveSuit('J', {color: 'red', parity: 'even'})).toBe('T')
})