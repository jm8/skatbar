export const SUITS = ['C', 'S', 'H', 'D'] as const;
export type Suit = typeof SUITS[number];
export const VALUES = ['2', '3', '4', '5', '6'] as const;
export type Value = typeof VALUES[number];
export type Card = `${Value}${Suit}` | 'J' | 'G';

export type Parity = 'even' | 'odd';
export type Color = 'red' | 'black';
export type Trump = { parity: Parity, color: Color };

export type EffectiveSuit = Suit | 'T';

export type VisibleState = {
  leader: number,
  played: Card[],
  player: number,
  hand: Set<Card>,
  won: Set<Card>[],
  trump: Trump,
};

export interface ClientToServerEvents {
  newGame: (numPlayers: number) => void
  run: () => void
}

export interface ServerToClientEvents {
  emitVisibleState: (visibleState: VisibleState) => void
}
