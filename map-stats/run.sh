#!/bin/bash

# Check if the correct number of arguments is provided
if [ $# -ne 2 ]; then
  echo "Usage: $0 <root_directory> <filename>"
  exit 1
fi

# Extract command-line arguments
root_directory="$1"
filename="$2"

echo "Generating JSON in 'generated_results/'..."
mkdir -p "generated_results"

# Use a for loop to iterate through the directories
for dir in $(find "$root_directory" -type d); do
  # Use the find command to search for the specified filename in the current directory
  matching_files=$(find "$dir" -maxdepth 1 -type f -name "$filename")

  # Check if any matching files were found
  if [ -n "$matching_files" ]; then
    last_folder=$(basename "$dir")
    node map-stats/supported_gamemodes.js "$matching_files" > "generated_results/${last_folder}.json"
  fi
done