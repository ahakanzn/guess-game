import { makeGuess, createGame, startGame } from "../assembly/index";

test("adds 1 + 2 to equal 3", () => {
  const gameId = createGame();
  startGame(gameId);
  const result = makeGuess(gameId);
  expect(result).toBe("You have made your guess!");
});
