#!/bin/bash

# Possibility to skip gen map ids with "./run.sh skip_gen"
skip="$1"

# Handle the whole workflow
## 1. Retrieve all map ids
## 2. Loop through all map ids
### a. Download 10 map files
### b. Read the 10 map files and generate JSON file with supported gamemodes for each
### c. Remove the 10 map files from the disk
## 3. Generate supported gamemodes for all maps in HTML
## 4. Remove the generated JSON files from the disk

# skip generation of map ids if skip === "skip_gen"
if [ "$skip" != "skip_gen" ]; then
    # 1. Retrieve all map ids
    echo "1. Generating map ids..."
    ./generate_map_ids.sh
fi

# 2. Loop through all map ids
echo "2. Looping through all map ids..."

# keep an index that is incremented 10 by 10
BUCKET_SIZE=10
# retrieve the number of map ids from generated.js file
MAP_IDS_LENGTH=$(cat generated_nb_maps.txt)

# function that get the next increment of index depending on map ids length
next_bucket_size() {
    _curr_index=$1
    _bucket_size=$((MAP_IDS_LENGTH - _curr_index >= BUCKET_SIZE ? BUCKET_SIZE : MAP_IDS_LENGTH - _curr_index))
    echo $_bucket_size
}

for ((map_ids_index = 0; map_ids_index < MAP_IDS_LENGTH; map_ids_index += 10)); do
    # a. Download 10 map files
    echo "a. Downloading 10 map files...: $map_ids_index/$MAP_IDS_LENGTH"

    bucket_size=$(next_bucket_size $map_ids_index)
    node download.js "$map_ids_index" "$bucket_size"

    # b. Read the 10 map files and generate JSON file with supported gamemodes for each
    echo "b. Reading 10 map files..."
    ./map-stats/run.sh "node_modules/steamcmd-interface/temp/steamcmd_bin/linux/linux32/steamapps/content/app_346120/" "bmap.txt"

    # c. Remove the 10 map files from the disk
    echo "c. Removing 10 map files..."
    rm -r "node_modules/steamcmd-interface/temp/steamcmd_bin/linux/linux32/steamapps/content/app_346120/"
done

# 3. Generate supported gamemodes for all maps in HTML
echo "3. Generating HTML summary from the JSON files..."
node map-stats/summary.js "generated_results/"

# 4. Remove the generated files from the disk
echo "4. Removing generated files..."
rm -r "generated_results"
rm -r "generated_maps_debug"
rm -r "generated_ids.js"
rm -r "generated_nb_maps.txt"
