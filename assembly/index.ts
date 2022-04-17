import { logging, context, ContractPromiseBatch, PersistentVector, u128, storage, Storage, MapEntry } from "near-sdk-as";
import { GuessGame, GameState, games } from "./model";

export function createGame(): u32 {
  const game = new GuessGame();
  game.creator = context.sender;
  game.gameState = GameState.Created;

  games.set(game.gameId, game);
  logging.log("yaratılan: " + games.get(game.gameId)!.toString());
  return game.gameId;
}

export function startGame(gameId: u32): string {
  assert(games.contains(gameId), "There is no such a game, please create one first!");
  const game = games.get(gameId)!;
  assert(game.creator == context.sender, "You have not created this game thus you can't start it!");
  //assert(game.gameState != GameState.Created, "Game is already started!");
  game.gameState = GameState.InProgress;
  games.set(game.gameId, game);
  return `Game has started: ${gameId}`;
}

export function makeGuess(gameId: u32): string {
  assert(games.contains(gameId), "Game does not exists!");
  logging.log("game id: " + gameId.toString());

  const game = games.get(gameId)!;
  //assert(game.creator != context.sender, "You can not join your own game!");
  //assert(game.gameState != GameState.InProgress, "Game is not started yet or already finished!");
  assert(!context.attachedDeposit.isZero || !isNull(context.attachedDeposit), "You have to add some deposit to play the game!");

  game.guesses.push(context.attachedDeposit);
  let attachedDeposit = context.attachedDeposit;

  let mapVal = game.guessMap.get(attachedDeposit);
  if (mapVal) {
    mapVal.push(context.sender);
    game.guessMap.set(attachedDeposit, mapVal);
  } else {
    mapVal = new PersistentVector<string>("s");
    mapVal.push(context.sender);
    game.guessMap.set(attachedDeposit, mapVal);
  }
  game.awardAmount = u128.add(game.awardAmount, context.attachedDeposit);
  game.gameState = GameState.InProgress;

  games.set(gameId, game);
  return "You have made your guess!";
}

export function finishGame(gameId: u32): string {
  assert(games.contains(gameId), "There is no such a game, please create one first!");
  const game = games.get(gameId)!;
  assert(game.creator == context.sender, "You have not created this game thus you can't finish it!");
  game.gameState = GameState.Completed;
  let winnerId = context.sender;
  let arr = bubbleSort(game.guesses, game.guesses.length);
  //for (let i = 0; i < arr.length; i++) {
  logging.log("arr: " + arr[0].toString());
  //logging.log("arr: " + arr[1].toString());
  /*let g = game.guessMap.get(u128.from(i));
    logging.log("guess map: " + g!.first.toString());
    if (g != null && g.length == 1) winnerId = g.first;*/
  //}
  /*
  assert(!isNull(winnerId), "No one won the game!");
  const to_winner = ContractPromiseBatch.create(winnerId);
  const amount_to_receive = game.awardAmount;
  to_winner.transfer(amount_to_receive);

  games.set(game.gameId, game);*/
  const amount_to_receive = 5;
  return `Congratulations: ${winnerId} is the winner and received ${amount_to_receive}`;
}

function swap(arr: PersistentVector<u128>, xp: i32, yp: i32): void {
  var temp = arr[xp];
  arr[xp] = arr[yp];
  arr[yp] = temp;
}

// An optimized version of Bubble Sort
function bubbleSort(arr: PersistentVector<u128>, n: i32): PersistentVector<u128> {
  var i: i32, j: i32;
  for (let i = 0; i < n - 1; i++) {
    for (j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
      }
    }
  }
  return arr;
}

export function getGuess(gameId: u32): void {
  let game = games.get(gameId)!;
  let i: i32;
  for (i = 0; i < game.guesses.length; i++) {
    logging.log(game.guesses.pop().toString());
  }
  logging.log("lenght: " + game.guesses.length.toString());
}
