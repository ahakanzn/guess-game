import { RNG, context, PersistentMap, u128, PersistentVector, storage } from "near-sdk-as";

export enum GameState {
  Created,
  InProgress,
  Completed,
}

@nearBindgen
export class GuessGame {
  gameId: u32;
  gameState: GameState;
  awardAmount: u128;
  creator: string;
  guessMap: PersistentMap<u128, PersistentVector<string>>;
  guesses: PersistentVector<u128>;

  constructor() {
    let rng = new RNG<u32>(1, u32.MAX_VALUE);
    let roll = rng.next();
    this.gameId = roll;

    this.gameState = GameState.Created;
    this.awardAmount = u128.Zero;
    this.creator = context.sender;
    this.guessMap = new PersistentMap<u128, PersistentVector<string>>("gMap");
    this.guesses = new PersistentVector<u128>("guesses");
  }

  toString(): string {
    return (
      "GuessGame{" +
      "gameId=" +
      this.gameId.toString() +
      ", gameState='" +
      this.gameState.toString() +
      "'" +
      ", awardAmount=" +
      this.awardAmount.toString() +
      ", creator='" +
      this.creator +
      "'" +
      "}"
    );
  }
}

export const games = new PersistentMap<u32, GuessGame>("games");
