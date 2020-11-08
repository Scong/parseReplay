Some changes to the wc3 parser were done manually to help parse around 2000 files.

```
I should fork this perhaps but I made these changes =>
node_modules/w3gjs/W3GReplay.js
handleChatMessage(block, timeMS) {
    const message = {
        ++++playerName: this.players[block.playerId] && this.players[block.playerId].name,
        playerId: block.playerId,
        message: block.message,
        mode: ChatMessageMode.Team,
        timeMS,
    };
    this.chatlog.push(message);
}
processCommandDataBlock(block) {
    const currentPlayer = this.players[block.playerId];
    +++++ if(!currentPlayer) return
    currentPlayer.currentTimePlayed = this.totalTimeTracker;
    currentPlayer._lastActionWasDeselect = false;
    block.actions.forEach((action) => {
        this.handleActionBlock(action, currentPlayer);
    });
}
```

To run something like this should work

`mkdir analytics`
`yarn install`
`node download.js`
`node processData.js`
