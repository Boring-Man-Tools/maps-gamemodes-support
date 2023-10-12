import { SteamCmd } from "steamcmd-interface";
import { MAP_IDS } from "./generated_ids.js";

const NEXT_BUCKET_INDEX = Number(process.argv[2]);
const NEXT_BUCKET_SIZE = Number(process.argv[3]);

const steamCmd = await SteamCmd.init({
  installDir: "generated_tmp/install",
});

const commands = MAP_IDS.slice(
  NEXT_BUCKET_INDEX,
  NEXT_BUCKET_INDEX + NEXT_BUCKET_SIZE
).map((id) => `download_item 346120 ${id}`);

for await (const progress of steamCmd.run(commands)) {
  console.log(progress);
}
