// @ts-check
import fs from "fs";
import path from "path";

//////////////// Generate HTML functions ////////////////

/**
 * Generate the HTML for survival.
 * @param {SurvivalInfo} info
 * @returns {string} generated HTML
 */
function generateHTMLForSurvival(info) {
  if (!info.classic) {
    return "❌";
  }

  return `
<div class="container-survival">
    <div>
        <span>Classic:</span>
        <span>${info.classic ? "✅" : "❌"}</span>
    </div>
    <br />
    <div>
        <span>Hardcore:</span>
        <span>${info.hardcore ? "✅" : "❌"}</span>
    </div>
</div>
  `;
}

/** Replace any single and double quotes by spaces */
const getCleanTitle = (title) => {
  return title.replace(/['"]+/g, " ");
};

/**
 * Generate the HTML for a result row
 * @param {GeneratedMapJSONData} data
 * @returns {string} HTML for a row
 */
function generateRowHTML(data) {
  const baseWorkshopItemURL =
    "https://steamcommunity.com/sharedfiles/filedetails/?id=";
  const isGoodForServer =
    data.climb ||
    (data.deathmatch &&
      data.teamDeathmatch &&
      data.captureTheFlag &&
      data.survival.classic &&
      data.survival.hardcore &&
      data.zombrains &&
      data.takeOver &&
      data.weaponDeal);
  const serverHTML = isGoodForServer
    ? `✅${data.climb ? " (climb)" : ""}`
    : "❌";

  const clonedData = {
    ...data,
    title: getCleanTitle(data.title),
    hosting: isGoodForServer,
  };

  const survivalHTML = generateHTMLForSurvival(data.survival);
  return `<tr class="map-row" data-map='${JSON.stringify(clonedData)}'>
    <td>${data.id}</td>
    <td><a href="${baseWorkshopItemURL}${data.id}" target="_blank">${
    data.title
  }</a></td>
    <td>${data.deathmatch ? "✅" : "❌"}</td>
    <td>${data.teamDeathmatch ? "✅" : "❌"}</td>
    <td>${data.captureTheFlag ? "✅" : "❌"}</td>
    <td>${survivalHTML}</td>
    <td>${data.zombrains ? "✅" : "❌"}</td>
    <td>${data.weaponDeal ? "✅" : "❌"}</td>
    <td>${data.takeOver ? "✅" : "❌"}</td>
    <td>${data.climb ? "✅" : "❌"}</td>
    <td />
    <td>${serverHTML}</td>
    </tr>`;
}

/**
 * Generate a summary about supported gamemodes for each map
 * in HTML.
 * @param {GeneratedMapJSONData[]} gamemodes
 */
function generateHTML(gamemodes) {
  let results = "";
  for (const gamemode of gamemodes) {
    results += generateRowHTML(gamemode);
  }
  const finalHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Supported Gamemodes</title>
<link rel="stylesheet" type="text/css" href="./pure.css" />
<link rel="stylesheet" type="text/css" href="./style.css" />
</head>
<body>
<div id="filters">
<!-- Filters -->
</div>
<table class="pure-table pure-table-horizontal">
<thead>
    <tr>
        <th>ID</th>
        <th>Map name</th>
        <th>DM</th>
        <th>TDM</th>
        <th>CTF</th>
        <th>SURV</th>
        <th>ZOMB</th>
        <th>WD</th>
        <th>TO</th>
        <th>CLB</th>
        <th></th>
        <th>Good for hosting</th>
    </tr>
</thead>
<tbody>
    ${results}
</tbody>
</table>
<script src="./script.js"></script>
</body>
</html>`;

  return finalHTML;
}

//////////////// Main code //////////////////////

const folderName = process.argv[2];

const files = fs.readdirSync(folderName);
/**
 * @type {GeneratedMapJSONData[]}
 */
const allMaps = [];

files.forEach((file) => {
  // Check if the file has a .json extension
  if (path.extname(file) === ".json") {
    const filePath = path.join(folderName, file);

    try {
      // Read the JSON file
      const fileContent = fs.readFileSync(filePath, "utf-8");
      /**
       * @type {GeneratedMapJSONData}
       */
      const data = JSON.parse(fileContent);
      allMaps.push(data);
    } catch (error) {
      console.error(error);
    }
  }
});

const html = generateHTML(allMaps);
fs.writeFileSync("html/index.html", html);
