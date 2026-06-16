export enum Fruit {
  CHERRY = 'cherry',
  APPLE = 'apple',
  BANANA = 'banana',
  LEMON = 'lemon',
}

export const REELS: [Fruit[], Fruit[], Fruit[]] = [
  [
    Fruit.CHERRY,
    Fruit.LEMON,
    Fruit.APPLE,
    Fruit.LEMON,
    Fruit.BANANA,
    Fruit.BANANA,
    Fruit.LEMON,
    Fruit.LEMON,
  ],
  [
    Fruit.LEMON,
    Fruit.APPLE,
    Fruit.LEMON,
    Fruit.LEMON,
    Fruit.CHERRY,
    Fruit.APPLE,
    Fruit.BANANA,
    Fruit.LEMON,
  ],
  [
    Fruit.LEMON,
    Fruit.APPLE,
    Fruit.LEMON,
    Fruit.APPLE,
    Fruit.CHERRY,
    Fruit.LEMON,
    Fruit.BANANA,
    Fruit.LEMON,
  ],
];

export const SPIN_COST = 1;

export const REWARDS_THREE: Record<string, number> = {
  cherry: 50,
  apple: 20,
  banana: 15,
  lemon: 3,
};

export const REWARDS_TWO: Record<string, number> = {
  cherry: 40,
  apple: 10,
  banana: 5,
};
