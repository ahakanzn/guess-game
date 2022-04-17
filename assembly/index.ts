import { context, ContractPromiseBatch, u128 } from "near-sdk-as";
import { GuessGame, games, GameState } from "./model";

export function createGame(): u32 {
  const game = new GuessGame();
  game.creator = context.sender;
  games.set(game.gameId, game);

  return game.gameId;
}

export function startGame(gameId: u32): string {
  assert(
    games.contains(gameId),
    "There is no such a game, please create one first!"
  );
  let game = games.getSome(gameId);
  assert(
    game.creator == context.sender,
    "You have not created this game thus you can't start it!"
  );
  game.gameState = GameState.InProgress;
  return `Game has started: ${gameId}`;
}

export function finishGame(gameId: u32): string {
  assert(
    games.contains(gameId),
    "There is no such a game, please create one first!"
  );
  const game = games.getSome(gameId);
  assert(
    game.creator == context.sender,
    "You have not created this game thus you can't finish it!"
  );
  game.gameState = GameState.Completed;
  let winnerId = "";
  let arr = sortArray(game.guessMap.keys());
  for (let i = 0; i < arr.length; i++) {
    let id = game.guessMap.get(u128.from(i));
    if (id != null && id.length == 1) winnerId = id.at(0);
  }

  assert(winnerId == "", "No one won the game!");
  const to_winner = ContractPromiseBatch.create(winnerId);
  const amount_to_receive = game.awardAmount;
  to_winner.transfer(amount_to_receive);

  games.set(game.gameId, game);
  return `Congratulations: ${winnerId} is the winner and received ${amount_to_receive}`;
}

function sortArray(arr: u128[]): u128[] {
  arr = arr.sort(function (a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  });
  return arr;
}

export function makeGuess(gameId: u32): string {
  assert(games.contains(gameId), "Game does not exists!");

  let game = games.getSome(gameId);
  assert(game.creator != context.sender, "You can not join your own game!");
  assert(
    game.gameState == GameState.InProgress,
    "Game is not started yet or already finished!"
  );
  assert(
    context.attachedDeposit.isZero || context.attachedDeposit == null,
    "You have to add some deposit to play the game!"
  );

  let guessArray = game.guessMap.get(context.attachedDeposit);

  if (game.guessMap.contains(context.attachedDeposit) && guessArray != null) {
    guessArray.push(context.sender);
    game.guessMap.set(context.attachedDeposit, guessArray);
  } else {
    guessArray = new Array<string>();
    guessArray.push(context.sender);
    game.guessMap.set(context.attachedDeposit, guessArray);
  }

  game.awardAmount = u128.add(game.awardAmount, context.attachedDeposit);
  game.gameState = GameState.InProgress;

  games.set(gameId, game);

  return "You have made your guess!";
}
