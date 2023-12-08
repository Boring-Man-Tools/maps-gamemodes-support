const maps = document.getElementsByClassName("map-row");

/** Generate filters here so it doesn't heavily depends on parsing every result */
const filtersContainer = document.getElementById("filters");
const filtersHTML = `
<input id="search" type="text" placeholder="Search by id or name" style="width: 175px;" />
<div style="display: flex; gap: 0.5rem; align-items: center;">
  <span>Filtered by:</span>

  <div class="checkbox-wrap">
      <ul class="radio-bar">
        <li><label for="all"><input type="radio" name="filteredBy" id="all" checked value="all" /><span>All</span></label></li>
        <li><label for="dm"><input type="radio" name="filteredBy" id="dm" checked value="dm" /><span>DM</span></label></li>
        <li><label for="tdm"><input type="radio" name="filteredBy" id="tdm" value="tdm" /><span>TDM</span></label></li>
        <li><label for="ctf"><input type="radio" name="filteredBy" id="ctf" value="ctf" /><span>CTF</span></label></li>
        <li><label for="surv"><input type="radio" name="filteredBy" id="surv" value="surv" /><span>SURV</span></label></li>
        <li><label for="zomb"><input type="radio" name="filteredBy" id="zomb" value="zomb" /><span>ZOMB</span></label></li>
        <li><label for="take_over"><input type="radio" name="filteredBy" id="take_over" value="take_over" /><span>TO</span></label></li>
        <li><label for="climb"><input type="radio" name="filteredBy" id="climb" value="climb" /><span>CLB</span></label></li>
        <li><label for="hosting_all"><input type="radio" name="filteredBy" id="hosting_all" value="hosting_all" /><span>Hosting (all)</span></label></li>
        <li><label for="hosting_no_climb"><input type="radio" name="filteredBy" id="hosting_no_climb" value="hosting_no_climb" /><span>Hosting (no CLB)</span></label></li>
      </ul>
  </div>
</div>

<div style="flex: auto">
  <button id="ids-generation" class="btn-download" data-tooltip="Generate file with IDs of filtered maps" data-flow="bottom">
    <div class="flex"><div class="gg-software-download"></div><span>IDs</span></div>
  </button>
  <button id="csv-generation" class="btn-download" data-tooltip="Generate CSV with info of filtered maps" data-flow="bottom">
    <div class="flex"><div class="gg-software-download"></div><span>CSV</span></div>
  </button>
</div>
`;

filtersContainer.innerHTML = filtersHTML;

const inputSearch = document.getElementById("search");
const sortByRadios = document.querySelectorAll(
  'input[type="radio"][name="filteredBy"]'
);

/**
 * Toggle visibility of maps depending on search value.
 * Only maps containing search value in id or title are displayed.
 * @param {string} value
 */
const showMapsFilteredBySearch = (value) => {
  const _value = value.toLowerCase();

  for (const map of maps) {
    const mapData = JSON.parse(map.getAttribute("data-map"));
    const mapId = mapData.id.toString();
    const mapTitle = mapData.title.toLowerCase();

    // check if value is contained in id or title
    const isMapIdMatch = mapId.includes(_value);
    const isMapTitleMatch = mapTitle.includes(_value);

    if (!isMapIdMatch && !isMapTitleMatch) {
      map.style.display = "none";
    } else {
      map.removeAttribute("style");
    }
  }
};

inputSearch.addEventListener("input", (ev) => {
  const value = ev.target.value;
  showMapsFilteredBySearch(value);
});

/**
 *
 * @param {"all"|"dm"|"tdm"|"ctf"|"surv"|"zomb"|"take_over"|"climb"|"hosting"|"hosting_no_climb"} value
 */
const showMapsFilteredByGamemode = (value) => {
  for (const map of maps) {
    /**
     * @type {GeneratedMapJSONData & {hosting: boolean}}
     */
    const mapData = JSON.parse(map.getAttribute("data-map"));
    if (value === "all") {
      map.removeAttribute("style");
    } else {
      if (
        (value === "dm" && mapData.deathmatch) ||
        (value === "tdm" && mapData.teamDeathmatch) ||
        (value === "ctf" && mapData.captureTheFlag) ||
        (value === "surv" && mapData.survival.classic) ||
        (value === "zomb" && mapData.zombrains) ||
        (value === "take_over" && mapData.takeOver) ||
        (value === "climb" && mapData.climb) ||
        (value === "hosting_all" && mapData.hosting) ||
        (value === "hosting_no_climb" && mapData.hosting && !mapData.climb)
      ) {
        map.removeAttribute("style");
      } else {
        map.style.display = "none";
      }
    }
  }
};

sortByRadios.forEach((radio) => {
  radio.addEventListener("change", (ev) => {
    const value = ev.target.value;
    showMapsFilteredByGamemode(value);
  });
});

/** Generation of files */
const idsGenerationButton = document.getElementById("ids-generation");
const csvGenerationButton = document.getElementById("csv-generation");

/**
 * Generate file with map ids only.
 * Only use ids of maps currently displayed.
 */
const generateIdsFile = () => {
  const ids = [];
  for (const map of maps) {
    if (map.style.display === "none") {
      continue;
    }
    const mapData = JSON.parse(map.getAttribute("data-map"));
    ids.push(mapData.id);
  }

  const blob = new Blob([ids.join("\n")], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bmapstats_ids.txt";
  link.click();
  URL.revokeObjectURL(link.href);
};

idsGenerationButton.addEventListener("click", generateIdsFile);

/**
 * Generate CSV file with map info.
 * Only use info of maps currently displayed.
 *
 * CSV format:
 * "id","title","deathmatch","teamDeathmatch","captureTheFlag","surv_classic","surv_hardcore","zombrains","weaponDeal","takeOver","climb","hosting"
 */
const generateInfoCSV = () => {
  const csvData = [
    [
      "id",
      "title",
      "deathmatch",
      "teamDeathmatch",
      "captureTheFlag",
      "surv_classic",
      "surv_hardcore",
      "zombrains",
      "weaponDeal",
      "takeOver",
      "climb",
      "hosting",
    ],
  ];
  for (const map of maps) {
    if (map.style.display === "none") {
      continue;
    }
    /**
     * @type {GeneratedMapJSONData & {hosting: boolean}}
     */
    const mapData = JSON.parse(map.getAttribute("data-map"));
    csvData.push([
      mapData.id,
      mapData.title,
      mapData.deathmatch,
      mapData.teamDeathmatch,
      mapData.captureTheFlag,
      mapData.survival.classic,
      mapData.survival.hardcore,
      mapData.zombrains,
      mapData.weaponDeal,
      mapData.takeOver,
      mapData.climb,
      mapData.hosting,
    ]);
  }

  const csvContent = csvData.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bmapstats_info.csv";
  link.click();
  URL.revokeObjectURL(link.href);
};

csvGenerationButton.addEventListener("click", generateInfoCSV);
