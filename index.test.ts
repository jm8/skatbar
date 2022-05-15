import { getEffectiveSuit, getPossibleMoves, Card } from './index'

test('effective suit', () => {
  expect(getEffectiveSuit('3H', { color: 'red', parity: 'even' })).toBe('H')
  expect(getEffectiveSuit('3H', { color: 'red', parity: 'odd' })).toBe('T')
  expect(getEffectiveSuit('6C', { color: 'red', parity: 'even' })).toBe('C')
  expect(getEffectiveSuit('J', { color: 'red', parity: 'even' })).toBe('T')
})

test('forced to follow suit', () => {
  expect(getPossibleMoves({
    leader: 0,
    won: [],
    played: ['5H'],
    player: 1,
    hand: new Set<Card>([
      '4H',
      '3H',
      '2D',
      'G',
      '5C',
      '3S',
      '2C',
      '4S',
    ]),
    trump: { color: 'red', parity: 'even' },
  })).toEqual(new Set<Card>([
    '3H',
  ]))
})

test('forced to play trump', () => {
  expect(getPossibleMoves({
    leader: 0,
    won: [],
    played: ['2H'],
    player: 1,
    hand: new Set<Card>([
      '4H',
      '3H',
      '2D',
      'G',
      '5C',
      '3S',
      '2C',
      '4S',
    ]),
    trump: { color: 'red', parity: 'even' },
  })).toEqual(new Set<Card>([
    '4H',
    '2D',
    'G',
  ]))
})

test('play whatever', () => {
  expect(getPossibleMoves({
    leader: 0,
    won: [],
    played: ['3S'],
    player: 1,
    hand: new Set<Card>([
      '4H',
      '3H',
      '2D',
      'G',
      '5C',
      '2C',
    ]),
    trump: { color: 'red', parity: 'even' },
  })).toEqual(new Set<Card>([
    '4H',
    '3H',
    '2D',
    'G',
    '5C',
    '2C',
  ]))
})