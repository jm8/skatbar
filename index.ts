export const SUITS = ['C', 'S', 'H', 'D'] as const;
export type Suit = typeof SUITS[number];
export const VALUES = ['2', '3', '4', '5', '6'] as const;
export type Value = typeof VALUES[number];
export type Card = `${Value}${Suit}` | 'J' | 'G';

export type Parity = 'even' | 'odd';
export type Color = 'red' | 'black';
export type Trump = { parity: Parity, color: Color };

export type EffectiveSuit = Suit | 'T';

export const DECK = [...SUITS.flatMap(suit => VALUES.map(value => `${value}${suit}`)), 'J', 'G'] as readonly Card[];

export function shuffledDeck(): Card[] {
  const result = [...DECK];

  let currentIndex = result.length;
  let randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]];
  }

  return result;
}

export function isTrump(card: Card, trump: Trump) {
  if (card === 'J' || card === 'G') return true;

  const value = card[0] as Value;
  const isEven = value === '2' || value === '4';
  const isTrumpParity = trump.parity === 'even' ? isEven : !isEven;

  const suit = card[1] as Suit;
  const isRed = suit === 'H' || suit === 'D';
  const isTrumpColor = trump.color === 'red' ? isRed : !isRed;

  return isTrumpParity && isTrumpColor;
}

export function getEffectiveSuit(card: Card, trump: Trump): EffectiveSuit {
  if (isTrump(card, trump)) return 'T';

  const suit = card[1] as Suit;
  return suit;
}

export function pointValue(card: Card) {
  if (card === 'J' || card === 'G') return 2;
  return Number(card[0]);
}

// what is given to someone when
// they decide how to move
export type VisibleState = {
  leader: number,
  played: Card[],
  hand: Set<Card>,
  won: Set<Card>[],
};

export function getPossibleMoves(state: VisibleState, trump: Trump): Set<Card> {
  if (state.played.length === 0) return state.hand;
  
  const effectiveSuit = getEffectiveSuit(state.played[0], trump);

  const followSuit = new Set<Card>();
  state.hand.forEach(card => {
    if (getEffectiveSuit(card, trump) === effectiveSuit) followSuit.add(card);
  });
  
  if (followSuit.size === 0) return state.hand;
  
  return followSuit;
}
