# guess-game
This is a game where players tries to deposit least unique amount of money. Contract collects all deposits in a poll and when the game is finished,
award gets transferred to the player who made the miniumum unique deposit. 

## Loom Video
https://www.loom.com/share/c47859a778da4f1db0b242ac09449f2f


## Installition
* Clone this repository to your computer.
```
git clone https://github.com/ahakanzn/guess-game.git
cd guess-game
yarn
```
* Login to your near account
```
near login
```
* Build and deploy the contract
```
yarn build:release
yarn deploy
```
* Export the development account to the $CONTRACT
```
export CONTRACT=<YOUR_DEV_ACCOUNT_HERE>
```
## How to Play?
* First you have to create a game
```
near call $CONTRACT createGame --accountId <YOUR_DEV_ACCOUNT_HERE>
```
You can the game id from the console and share it with the players
* Start the game
```
near call $CONTRACT startGame '{"gameId": <gameId>}' --accountId <YOUR_DEV_ACCOUNT_HERE>
```
* Now players can start to deposit and make their guesses
```
near call $CONTRACT makeGuess '{"gameId": <gameId>}' --accountId <YOUR_DEV_ACCOUNT_HERE> --amount <amountToDeopsit>
```
* Creator of the game can end the game with this command
```
near call $CONTRACT endGame '{"gameId": <gameId>}' --accountId <YOUR_DEV_ACCOUNT_HERE>
```
When this function is called winner get selected and award is sent to him.

* User can see the games with these commands
```
near view $CONTRACT getGame '{"gameId": <gameId>}' --accountId <YOUR_DEV_ACCOUNT_HERE>
near view $CONTRACT getGame --accountId <YOUR_DEV_ACCOUNT_HERE>
```
