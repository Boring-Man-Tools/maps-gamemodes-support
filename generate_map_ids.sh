#!/bin/bash

# base url of the page
_BASE_URL="https://steamcommunity.com/workshop/browse/?appid=346120&browsesort=mostrecent&requiredtags[]=Map"

# grep the total number of maps, e.g. "925 entries matching filters" (may contain a thousands separator)
max_number_of_elements=$(curl --silent "$_BASE_URL" | grep -oE '[0-9,]+ entries matching filters' | head -n 1 | grep -oE '^[0-9,]+' | tr -d ',')

# there are up to 30 elements per page
max_page=$(((max_number_of_elements + 29) / 30))

echo "max page: $max_page"
echo "Number of maps: $max_number_of_elements"

resulting_element_ids=()

append_element_ids_for_page() {
    page=$1
    # each map link appears twice on the page (thumbnail + title), keep unique ids in order
    element_ids_grep_output=$(curl --silent "${_BASE_URL}&p=${page}" | grep -oE 'filedetails/\?id=[0-9]+' | grep -oE "[0-9]+" | awk '!seen[$0]++')

    # process each line and append to the array
    while IFS= read -r line; do
        # use grep to extract the element id
        element_id=$(echo "$line" | grep -oE '[0-9]+')
        resulting_element_ids+=("$element_id")
    done <<< "$element_ids_grep_output"
}

for page in $(seq 1 "$max_page"); do
    max_number_of_elements_for_page=$((page * 30))
    echo -ne "Processing: page $page/$max_page - $max_number_of_elements_for_page/$max_number_of_elements.\r"
    append_element_ids_for_page "$page"
done

echo ""
echo "Found ${#resulting_element_ids[@]} maps."


# generate map ids as an array to generated_ids.js
echo "export const MAP_IDS = [" >> generated_ids.js
for element_id in "${resulting_element_ids[@]}"; do
    echo "    $element_id," >> generated_ids.js
done
echo "];" >> generated_ids.js

# write number of elements to info.txt
echo "${#resulting_element_ids[@]}" > generated_nb_maps.txt