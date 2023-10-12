# bmap-stats

List all the maps for the game Boring Man and the gamemodes they currently support.

The maps displayed are the maps from the Steam workshop.

## Goal of this list

The goals I wanted to achieve with this are:

- Have a way to quickly check if a map supports a specific gamemode
- Retrieve a list of ids of all maps supporting specific gamemodes

## How to use locally

```bash
yarn install
chmod +x run.sh # make run.sh executable
./run.sh
```

_**Note**:_
_I've put a limit of 10 maps to be downloaded before checking for gamemodes._
_This hard limit exists because the generaton is supposed to happen in a github action job and I wanted to avoid hitting the limit on the virtual disk. You can change it in `./run.sh` using the variable `BUCKET_SIZE`._

## Generated files

Here are all the generated files while `./run.sh` is running:

- `generated_ids.js`: JS file that exports `MAP_IDS` which is a list of all map.
- `generated_nb_maps.txt`: Plain file that has the number of maps (_simplest way I found to retrieve it_).
- `generated_results/`: Contains JSON files. Each JSON represents a map that was analyzed and the gamemodes that it supports.
- `generated_maps_debug/`: Can be generated for debug purposes. See end of `supported_gamemodes.js` if you need to debug a map.
- `html/index.html`: Final HTML file. It displays the summary of the supported gamemodes per map. You can filter by gamemodes and download details of filtered maps.

By default, the bash script remove all `generated_*` files to avoid cluttering the repository.
