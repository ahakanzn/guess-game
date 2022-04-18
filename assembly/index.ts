import { Context } from "near-sdk-as";
import { GuessGame, GameState, games } from "./model";

export function createGame(): GuessGame {
  return GuessGame.createGame(Context.sender);
}

export function startGame(gameId: u32): GuessGame {
  return GuessGame.startGame(gameId);
}

export function makeGuess(gameId: u32): GuessGame {
  return GuessGame.makeGuess(gameId);
}

export function finishGame(gameId: u32): string {
  return GuessGame.finishGame(gameId);
}

export function getGames(start: u32, limit: u32): GuessGame[] {
  return GuessGame.findGames(start, limit);
}

export function getGame(gameId: u32): GuessGame {
  return GuessGame.findGameById(gameId);
}
