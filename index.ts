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

export function shuffleDeck(): Card[] {
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
  player: number,
  hand: Set<Card>,
  won: Set<Card>[],
  trump: Trump,
};

type StateWithoutTrump = {
  leader: number,
  played: Card[],
  player: number,
  hands: Set<Card>[],
  won: Set<Card>[],
}

export type EntireState = StateWithoutTrump & {
  trump: Trump,
};

export function reduceToVisible(state: EntireState): VisibleState {
  return {
    leader: state.leader,
    played: state.played,
    hand: state.hands[state.player],
    player: state.player,
    trump: state.trump,
    won: state.won,
  };
}

export function getPossibleMoves(state: VisibleState): Set<Card> {
  if (state.played.length === 0) return state.hand;
  
  const effectiveSuit = getEffectiveSuit(state.played[0], state.trump);

  const followSuit = new Set<Card>();
  state.hand.forEach(card => {
    if (getEffectiveSuit(card, state.trump) === effectiveSuit) followSuit.add(card);
  });
  
  if (followSuit.size === 0) return state.hand;
  
  return followSuit;
}

function arrayOfSets<T>(n: number): Set<T>[] {
  let a = [];
  for (let i = 0; i < n; i++) {
    a.push(new Set<T>());
  }
  return a;
}

export function deal(numPlayers: number, numCards: number): StateWithoutTrump {
  const deck = shuffleDeck();
  
  let hands = arrayOfSets<Card>(numPlayers);
  
  for (let i = 0; i < numCards; i++) {
    for (let j = 0; j < numPlayers; j++) {
      hands[j].add(deck.pop()!);
    }
  }
  
  return {
    leader: 0,
    played: [],
    player: 0,
    hands,
    won: arrayOfSets(numPlayers),
  };
}

async function randomAi(visibleState: VisibleState, possibleMoves: Set<Card>): Promise<Card> {
  return [...possibleMoves][Math.floor(Math.random()*possibleMoves.size)];
}

async function getPlayerMove(visibleState: VisibleState, possibleMoves: Set<Card>): Promise<Card> {
  console.log(visibleState.played);
  console.log(visibleState.hand);
  return prompt("your move: ") as Card;
}

async function doMove(state: EntireState, f: (visibleState: VisibleState, possibleMoves: Set<Card>) => Promise<Card>): Promise<EntireState> {
  const visibleState = reduceToVisible(state);
  const possibleMoves = getPossibleMoves(visibleState);
  const move = await f(visibleState, possibleMoves);
  if (!possibleMoves.has(move)) return state;
  
  // HACK: this is mutating state. hopefully this doesn't cause problems
  state.hands[state.player].delete(move)
  state.played.push(move);
  
  if (state.played.length === state.hands.length) {
    state = takeTrick(state);
  }

  return state;
}

function getOrderingValue(card: Card, leadingSuit: EffectiveSuit, trump: Trump) {
  const effectiveSuit = getEffectiveSuit(card, trump);
  if (effectiveSuit !== leadingSuit && effectiveSuit !== 'T') return 0;
  if (card === 'G') return 201;
  if (card === 'J') return 200;

  const value = Number(card[0] as Value);
  if (effectiveSuit === 'T') return value + 100;
  return value;
}

function getMaxCardIndex(cards: Card[], trump: Trump): number {
  const leadingSuit = getEffectiveSuit(cards[0], trump);
  let resultIndex = -1;
  let maxOrderingValue = -1;

  for (let i = 0; i < cards.length; i++) {
    const orderingValue = getOrderingValue(cards[i], leadingSuit, trump);
    if (orderingValue > maxOrderingValue) {
      resultIndex = i;
      maxOrderingValue = orderingValue;
    }
  }

  return resultIndex;
}

function takeTrick(state: EntireState): EntireState {
  const maxCardIndex = getMaxCardIndex(state.played, state.trump);
  const maxCardPlayer = (state.leader + maxCardIndex) % state.won.length;
  // HACK: this is mutating state again. hopefully this doesn't cause problems again.
  for (const card of state.played) {
    state.won[maxCardPlayer].add(card);
  }
  state.played = [];
  state.leader = state.player = state.leader;
  return state;
}

export async function main() {
  const state = deal(3, 5);
  const stateWithTrump: EntireState = {...state, trump: {color: 'red', parity: 'even'}}
  let currState = stateWithTrump;
  for (let i = 0; i < 10; i++) {
    console.log(currState);
    // const f = currState.player === 0 ? getPlayerMove : randomAi;
    const f = randomAi;
    currState = await doMove(currState, f);
  }
}

main();
