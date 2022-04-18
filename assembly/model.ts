import { RNG, u128, PersistentVector, PersistentUnorderedMap, ContractPromiseBatch, logging, context } from "near-sdk-as";

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
  creator: string = context.sender;
  guessMap: PersistentUnorderedMap<u128, Array<string>> = new PersistentUnorderedMap<u128, Array<string>>("guesses");
  constructor() {
    let rng = new RNG<u32>(1, u32.MAX_VALUE);
    let roll = rng.next();
    this.gameId = roll;

    this.gameState = GameState.Created;
    this.awardAmount = u128.Zero;
    this.creator = context.sender;
  }

  static createGame(): GuessGame {
    const game = new GuessGame();
    logging.log("game created");
    game.gameState = GameState.Created;
    games.set(game.gameId, game);
    logging.log("mape atıldı");
    return game;
  }

  static startGame(gameId: u32): GuessGame {
    assert(games.contains(gameId), "There is no such a game, please create one first!");
    const game = games.get(gameId)!;

    assert(game.creator == context.sender, "You have not created this game thus you can't start it!");
    assert(game.gameState != GameState.InProgress, "Game is already started!");

    game.gameState = GameState.InProgress;
    games.set(game.gameId, game);
    return game;
  }

  checkMap(attachedDeposit: u128, sender: string): void {
    let mapVal = new Array<string>();
    if (this.guessMap.contains(attachedDeposit)) {
      logging.log("ife girdi");
      mapVal = this.guessMap.getSome(attachedDeposit);
      mapVal.push(sender);
      this.guessMap.set(attachedDeposit, mapVal);
    } else {
      logging.log("else girdi");
      mapVal.push(sender);
      this.guessMap.set(attachedDeposit, mapVal);
    }
  }

  static makeGuess(gameId: u32): GuessGame {
    assert(games.contains(gameId), "Game does not exists!");
    const game = games.get(gameId)!;

    assert(game.creator != context.sender, "You can not join your own game!");
    assert(game.gameState == GameState.InProgress, "Game is not started yet or already finished!");
    assert(!context.attachedDeposit.isZero || !isNull(context.attachedDeposit), "You have to add some deposit to play the game!");

    let attachedDeposit = context.attachedDeposit;
    const sender = context.sender;
    logging.log("Tahmin yapan: " + sender);
    game.checkMap(attachedDeposit, sender);
    game.awardAmount = u128.add(game.awardAmount, context.attachedDeposit);
    games.set(gameId, game);
    return game;
  }

  /*static getGameMap(gameId: u32): Array<string>[] {
    const game = games.getSome(gameId);
    return game.guessMap.values(0);
  }*/

  static finishGame(gameId: u32): string {
    assert(games.contains(gameId), "There is no such a game, please create one first!");

    const game = games.get(gameId)!;
    assert(game.creator == context.sender, "You have not created this game thus you can't finish it!");
    let winnerId: string = "";
    let sortedKeys = game.guessMap.keys(0, game.guessMap.length).sort();
    for (let i = 0; i < sortedKeys.length; i++) {
      if (game.guessMap.get(sortedKeys.at(i))!.length == 1) {
        winnerId = game.guessMap.get(sortedKeys.at(i))!.at(0)!;
      }
    }
    logging.log("winner: " + winnerId);

    assert(!isNull(winnerId), "No one won the game!");

    const to_winner = ContractPromiseBatch.create(winnerId);
    const amount_to_receive = game.awardAmount;
    to_winner.transfer(amount_to_receive);

    game.gameState = GameState.Completed;
    games.set(game.gameId, game);
    return `Congratulations: ${winnerId} is the winner and received ${amount_to_receive}`;
  }

  static findGames(offset: u32, limit: u32 = 10): GuessGame[] {
    return games.values(offset, limit + offset);
  }

  static findGameById(id: u32): GuessGame {
    return games.getSome(id);
  }
}

export const games = new PersistentUnorderedMap<u32, GuessGame>("games");
