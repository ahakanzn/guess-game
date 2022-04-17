import { PersistentVector, RNG, context, PersistentUnorderedMap, logging, storage, u128 } from "near-sdk-as";

export enum GameState {
  Created,
  InProgress,
  Completed
}

@nearBindgen
export class GuessGame {
  gameId: u32;
  gameState: GameState;
  awardAmount: u128;
  creator: string;
  guessMap: PersistentUnorderedMap<u128,Array<string>>;


  constructor() {
    let rng = new RNG<u32>(1, u32.MAX_VALUE);
    let roll = rng.next();
    this.gameId = roll;

    this.gameState = GameState.Created;
    this.awardAmount = u128.Zero;
    this.creator = context.sender;
    this.guessMap = new PersistentUnorderedMap<u128,Array<string>>("m");


  }
}

export const games = new PersistentUnorderedMap<u32, GuessGame>("g");