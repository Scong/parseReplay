var glob = require("glob");
var fs = require("fs");
function perform() {
  // options is optional
  glob("./downloads/**/parsed_*.json", null, function (er, files) {
    const computedAnalytics = Object.values(
      files.reduce((analytics, file) => {
        const parsedJSON = JSON.parse(fs.readFileSync(file));
        parsedJSON.players.forEach((player) => {
          analytics[player.name] = {
            farmsBuilt:
              ((analytics[player.name] && analytics[player.name].farmsBuilt) ||
                0) +
              Object.values(player.buildings.summary).reduce(
                (a, b) => a + b,
                0
              ),
            name: player.name,
          };
          console.log(
            player.name,
            "farms Built:",
            analytics[player.name].farmsBuilt
          );
        });

        return analytics;
      }, {})
    ).sort(function (a, b) {
      return b.farmsBuilt - a.farmsBuilt;
    });

    fs.writeFileSync(
      "./analytics/farmsBuilt.json",
      JSON.stringify(computedAnalytics, null, 2)
    );
  });
}

perform();
