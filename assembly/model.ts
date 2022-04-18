import { RNG, Context, u128, PersistentVector, PersistentUnorderedMap, ContractPromiseBatch } from "near-sdk-as";

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
  creator: string = Context.sender;
  guessMap: PersistentUnorderedMap<u128, PersistentVector<string>> = new PersistentUnorderedMap<u128, PersistentVector<string>>("map");

  constructor() {
    let rng = new RNG<u32>(1, u32.MAX_VALUE);
    let roll = rng.next();
    this.gameId = roll;

    this.gameState = GameState.Created;
    this.awardAmount = u128.Zero;
    this.creator = Context.sender;
  }

  static createGame(creator: string): GuessGame {
    const game = new GuessGame();
    game.gameState = GameState.Created;
    games.set(game.gameId, game);
    return game;
  }

  static startGame(gameId: u32): GuessGame {
    assert(games.contains(gameId), "There is no such a game, please create one first!");
    const game = games.get(gameId)!;

    assert(game.creator == Context.sender, "You have not created this game thus you can't start it!");
    assert(game.gameState != GameState.InProgress, "Game is already started!");

    game.gameState = GameState.InProgress;
    games.set(game.gameId, game);
    return game;
  }

  static makeGuess(gameId: u32): GuessGame {
    assert(games.contains(gameId), "Game does not exists!");
    const game = games.get(gameId)!;

    assert(game.creator != Context.sender, "You can not join your own game!");
    assert(game.gameState != GameState.InProgress, "Game is not started yet or already finished!");
    assert(!Context.attachedDeposit.isZero || !isNull(Context.attachedDeposit), "You have to add some deposit to play the game!");

    let attachedDeposit = Context.attachedDeposit;
    let mapVal = game.guessMap.get(attachedDeposit, new PersistentVector<string>("new"));
    if (!isNull(mapVal) || mapVal!.isEmpty) {
      mapVal!.push(Context.sender);
      game.guessMap.set(attachedDeposit, mapVal!);
    } else {
      mapVal = new PersistentVector<string>("s");
      mapVal.push(Context.sender);
      game.guessMap.set(attachedDeposit, mapVal);
    }
    game.awardAmount = u128.add(game.awardAmount, Context.attachedDeposit);
    games.set(gameId, game);
    return game;
  }

  static finishGame(gameId: u32): string {
    assert(games.contains(gameId), "There is no such a game, please create one first!");

    const game = games.get(gameId)!;
    assert(game.creator == Context.sender, "You have not created this game thus you can't finish it!");

    game.guessMap.keys(0, game.guessMap.length).sort();
    let winner = game.guessMap
      .values(0, game.guessMap.length)
      .reduce((a: PersistentVector<string>, b: PersistentVector<string>) => (a.length <= b.length ? a : b), game.guessMap.values(0, 1).at(0));
    let winnerId = winner.first.toString();
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

// An optimized version of Bubble Sort
