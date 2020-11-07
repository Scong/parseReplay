const fetch = require("node-fetch");
const util = require("util");
const fs = require("fs");
const streamPipeline = util.promisify(require("stream").pipeline);
const W3GReplay = require("w3gjs").default;
const parser = new W3GReplay();
const rimraf = require("rimraf");
const pageSize = 15;
async function downloadAndParseReplay(replay) {
  const replayDir = `./downloads/${replay.id}/`;

  if (fs.existsSync(replayDir)) {
    console.log("skipping replay, all ready fetched. ", replay.id);
    return true;
  }
  fs.mkdirSync(replayDir, { recursive: true });

  try {
    const wc3statsResponse = await fetch(
      `https://api.wc3stats.com/replays/${replay.id}`
    );

    if (!wc3statsResponse.ok) {
      throw new Error(`unexpected response wc3stats ${response.statusText}`);
    }

    const wc3statsJsonFilePath = `${replayDir}wc3stats_${replay.name}_${replay.id}.json`;
    await streamPipeline(
      wc3statsResponse.body,
      fs.createWriteStream(wc3statsJsonFilePath)
    );

    const json = JSON.parse(fs.readFileSync(wc3statsJsonFilePath));
    const file = await fetch(json.body.file);

    if (!file.ok) {
      throw new Error(`failed to fetch replay wc3stats ${response.statusText}`);
    }

    const fileName = `${replayDir}${replay.name}_${replay.id}.w3g`;
    await streamPipeline(file.body, fs.createWriteStream(fileName));

    fs.writeFileSync(
      `${replayDir}parsed_${replay.name}_${replay.id}.json`,
      JSON.stringify(await parser.parse(fileName), null, 2)
    );
  } catch (e) {
    console.log(
      "failed to handle replay, recovering, skipping",
      "id",
      replay.id,
      "name",
      replay.name,
      "map",
      replay.map
    );
    console.log(e);
    rimraf.sync(replayDir);
  }
}

async function downloadResults(results) {
  const replays = results.body;
  await Promise.all(replays.map(downloadAndParseReplay)).catch((e) => {
    throw e;
  });
}

async function getReplaysPage(page) {
  return await (
    await fetch(
      `https://api.wc3stats.com/replays&search=Sheep Tag&page=${page}&limit=${pageSize}`
    )
  ).json();
}

async function perform() {
  let page = 1;
  const initialResult = await getReplaysPage(page);
  // console.log(initialResult);

  let totalPages = initialResult.pagination.totalPages;

  await downloadResults(initialResult);
  while (page < totalPages) {
    page++;
    console.log("page: ", page, " of ", totalPages);
    const nextResult = await getReplaysPage(page);
    await downloadResults(nextResult);
  }
}

perform();
