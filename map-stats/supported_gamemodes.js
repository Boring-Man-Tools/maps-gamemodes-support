// @ts-check
import fs from "fs";

/////////////// Functions //////////////

/**
 * Read the map file and returns an object containing the map configuration
 * @param {string} mapFilePath
 * @returns {MapConfig} Map config
 */
function readFile(mapFilePath) {
  const lineObject = {}; // Object to store lines with line numbers
  const fileData = fs.readFileSync(mapFilePath, "utf-8");
  const lines = fileData.split("\r\n");
  lines.forEach((line, index) => {
    // Store each line in the lineObject with the line number as the key
    lineObject[index] = line;
  });

  /**
   * @type {MapConfig}
   */
  const mapConfig = {};
  mapConfig["title"] = lineObject["0"];
  mapConfig["isClimb"] = lineObject["1"] === "1";
  mapConfig["mapID"] = Number(lineObject["2"]);
  mapConfig["objects"] = JSON.parse(lineObject["3"]);
  mapConfig["images"] = JSON.parse(lineObject["4"]);
  return mapConfig;
}

/**
 * Function to remove all images from the objects
 * @param {MapConfig} mapConfig
 * @returns {MapConfig} Map config without images
 */
function removeImages(mapConfig) {
  const objects = mapConfig.objects;
  Object.entries(objects).forEach(([key, value]) => {
    if (value.Name.endsWith(".png")) {
      delete objects[key];
    }
  });
  return mapConfig;
}

/**
 * Write objects to a file as JSON.
 * @param {MapObjects} objects
 * @param {string} filename
 */
function writeObjectsToFile(objects, filename = "objects.json") {
  fs.writeFileSync(`generated_maps_debug/${filename}`, JSON.stringify(objects));
}

/////////////////// Functions to check if a map supports gamemodes ///////////////////

/**
 * Check if deathmatch is supported.
 *
 * Check for `Player Spawn` object.
 *
 * @param {MapConfig} mapConfig
 * @returns {boolean} whether deathmatch is supported
 */
function isDeathmatchSupported(mapConfig) {
  const objects = mapConfig.objects;
  let hasPlayerSpawn = false;
  Object.values(objects).forEach((value) => {
    if (value.Name === "Player Spawn") {
      hasPlayerSpawn = true;
    }
  });
  return hasPlayerSpawn;
}

/**
 * Check if team deathmatch is supported.
 *
 * Check for:
 * - `USC Spawn` object.
 * - `THE MAN Spawn` object.
 * - `TDM Flag` object.
 *
 * @param {MapConfig} mapConfig
 * @returns {boolean} whether team deathmatch is supported
 */
function isTeamDeathmatchSupported(mapConfig) {
  const objects = mapConfig.objects;

  let hasUSCSpawn = false;
  let hasTHEMANSpawn = false;
  let hasTDMFlag = false;
  Object.values(objects).forEach((value) => {
    if (value.Name === "USC Spawn") {
      hasUSCSpawn = true;
    }
    if (value.Name === "THE MAN Spawn") {
      hasTHEMANSpawn = true;
    }
    if (value.Name === "TDM Flag") {
      hasTDMFlag = true;
    }
  });
  return hasUSCSpawn && hasTHEMANSpawn && hasTDMFlag;
}

/**
 * Check if survival is supported.
 *
 * Check for:
 * - `Player Spawn` object (for the enemies) or `Enemy Spawn (Survival)` object.
 * - `USC Spawn` object (for the survivors).
 * - `Chest Spawn (Survival)` object.
 * - `Objective Spawn (Survival)` object.
 * - `Bar Spawn (Survival)` object.
 * - `Beacon Spawn (Survival)` object.
 *
 * @param {MapConfig} mapConfig
 * @returns {SurvivalInfo} whether survival is supported
 */
function isSurvivalSupported(mapConfig) {
  const objects = mapConfig.objects;

  let hasObjective = false;
  let hasBeacon = false;
  let hasChest = false;
  let hasBar = false;
  let hasEnemiesSpawn = false;
  let hasSurvivorsSpawn = false;

  Object.values(objects).forEach((value) => {
    if (value.Name === "Objective Spawn (Survival)") {
      hasObjective = true;
    }
    if (value.Name === "Chest Spawn (Survival)") {
      hasChest = true;
    }
    if (value.Name === "Bar Spawn (Survival)") {
      hasBar = true;
      hasBeacon = true; // if no beacon spawn, it uses a bar spawn
    }
    if (value.Name === "Beacon Spawn (Survival)") {
      hasBeacon = true;
    }
    if (
      value.Name === "Player Spawn" ||
      value.Name === "Enemy Spawn (Survival)"
    ) {
      hasEnemiesSpawn = true;
    }
    if (value.Name === "USC Spawn") {
      hasSurvivorsSpawn = true;
    }
  });

  /**
   * @type {SurvivalInfo}
   */
  const info = {
    minimal: hasEnemiesSpawn && hasSurvivorsSpawn,
    classic: hasEnemiesSpawn && hasSurvivorsSpawn && hasChest,
    hardcore:
      hasEnemiesSpawn &&
      hasSurvivorsSpawn &&
      hasChest &&
      hasBar &&
      hasObjective,
    beacon: hasBeacon,
  };
  return info;
}

/**
 * Check if climb is supported
 *
 * Check if the type of the map is a climb map
 * and there is a `Climb Flag` object.
 * @param {MapConfig} mapConfig
 * @returns {boolean} whether climb is supported
 */
function isClimbSupported(mapConfig) {
  const isMapClimb = mapConfig.isClimb;
  let hasClimbFlag = false;

  Object.values(mapConfig.objects).forEach((value) => {
    if (value.Name === "Climb Flag") {
      hasClimbFlag = true;
    }
  });

  return isMapClimb && hasClimbFlag;
}

/**
 * Check if take over is supported.
 *
 * Check for:
 * - `Takeover Flag` object or `TDM Flag` object.
 * - `USC Spawn` object.
 * - `THE MAN Spawn` object.
 *
 * @param {MapConfig} mapConfig
 * @returns {boolean} whether take over is supported
 */
function isTakeOverSupported(mapConfig) {
  const objects = mapConfig.objects;

  let hasFlag = false;
  let hasUSCSpawn = false;
  let hasTHEMANSpawn = false;

  Object.values(objects).forEach((value) => {
    if (value.Name === "Takeover Flag" || value.Name === "TDM Flag") {
      hasFlag = true;
    }
    if (value.Name === "USC Spawn") {
      hasUSCSpawn = true;
    }
    if (value.Name === "THE MAN Spawn") {
      hasTHEMANSpawn = true;
    }
  });
  return hasFlag && hasUSCSpawn && hasTHEMANSpawn;
}

/**
 * Check if Capture the flag is supported.
 *
 * Check for:
 * - `USC Spawn` object.
 * - `THE MAN Spawn` object.
 * - `USC CTF Flag` object.
 * - `THE MAN CTF Flag` object.
 * - `USC Resupply` object.
 * - `THE MAN Resupply` object.
 * - `USC Generator` object.
 * - `THE MAN Generator` object.
 * - `USC Turret` object.
 * - `THE MAN Turret` object.
 *
 * @param {MapConfig} mapConfig
 * @returns {boolean} whether Capture the flag is supported
 */
function isCaptureTheFlagSupported(mapConfig) {
  const objects = mapConfig.objects;

  let hasUSCSpawn = false;
  let hasTHEMANSpawn = false;
  let hasUSCTFFlag = false;
  let hasTHEMANFlag = false;
  let hasUSCResupply = false;
  let hasTHEMANResupply = false;
  let hasUSCGenerator = false;
  let hasTHEMANGenerator = false;
  let hasUSCTurret = false;
  let hasTHEMANTurret = false;

  Object.values(objects).forEach((value) => {
    if (value.Name === "USC Spawn") {
      hasUSCSpawn = true;
    }
    if (value.Name === "THE MAN Spawn") {
      hasTHEMANSpawn = true;
    }
    if (value.Name === "USC CTF Flag") {
      hasUSCTFFlag = true;
    }
    if (value.Name === "THE MAN CTF Flag") {
      hasTHEMANFlag = true;
    }
    if (value.Name === "USC Resupply") {
      hasUSCResupply = true;
    }
    if (value.Name === "THE MAN Resupply") {
      hasTHEMANResupply = true;
    }
    if (value.Name === "USC Generator") {
      hasUSCGenerator = true;
    }
    if (value.Name === "THE MAN Generator") {
      hasTHEMANGenerator = true;
    }
    if (value.Name === "USC Turret") {
      hasUSCTurret = true;
    }
    if (value.Name === "THE MAN Turret") {
      hasTHEMANTurret = true;
    }
  });
  return (
    hasUSCSpawn &&
    hasTHEMANSpawn &&
    hasUSCTFFlag &&
    hasTHEMANFlag &&
    hasUSCResupply &&
    hasTHEMANResupply &&
    hasUSCGenerator &&
    hasTHEMANGenerator &&
    hasUSCTurret &&
    hasTHEMANTurret
  );
}

/**
 * Check if Zombrains is supported.
 *
 * Check for:
 * - `Player Spawn` object or `USC Spawn` object and `Zombie Spawn (Zombrains)` object.
 * - `Helicopter Spawn (Zombrains)` object.
 * - `Weapon Printer (Zombrains)` object.
 *
 * @param {MapConfig} mapConfig
 * @returns {boolean} whether Zombrains is supported
 */
function isZombrainsSupported(mapConfig) {
  const objects = mapConfig.objects;

  let hasPlayerSpawn = false;
  let hasUSCSpawn = false;
  let hasZombieSpawn = false;
  let hasHelicopterSpawn = false;
  let hasWeaponPrinter = false;

  Object.values(objects).forEach((value) => {
    if (value.Name === "Player Spawn") {
      hasPlayerSpawn = true;
    }
    if (value.Name === "USC Spawn") {
      hasUSCSpawn = true;
    }
    if (value.Name === "Zombie Spawn (Zombrains)") {
      hasZombieSpawn = true;
    }
    if (value.Name === "Helicopter Spawn (Zombrains)") {
      hasHelicopterSpawn = true;
    }
    if (value.Name === "Weapon Printer (Zombrains)") {
      hasWeaponPrinter = true;
    }
  });
  return (
    (hasPlayerSpawn || (hasUSCSpawn && hasZombieSpawn)) &&
    hasHelicopterSpawn &&
    hasWeaponPrinter
  );
}

/**
 * Find supported gamemodes for a map
 * @param {MapConfig} mapConfig
 * @returns {GamemodesInfo} Supported gamemodes
 */
function findSupportedGamemodes(mapConfig) {
  /**
   * @type {GamemodesInfo}
   */
  const gamemodes = {
    climb: false,
    survival: {
      minimal: false,
      classic: false,
      hardcore: false,
      beacon: false,
    },
    deathmatch: false,
    teamDeathmatch: false,
    weaponDeal: false,
    zombrains: false,
    takeOver: false,
    captureTheFlag: false,
  };
  gamemodes.climb = isClimbSupported(mapConfig);
  gamemodes.survival = isSurvivalSupported(mapConfig);
  gamemodes.deathmatch = isDeathmatchSupported(mapConfig);
  gamemodes.weaponDeal = gamemodes.deathmatch;
  gamemodes.teamDeathmatch = isTeamDeathmatchSupported(mapConfig);
  gamemodes.zombrains = isZombrainsSupported(mapConfig);
  gamemodes.takeOver = isTakeOverSupported(mapConfig);
  gamemodes.captureTheFlag = isCaptureTheFlagSupported(mapConfig);

  return gamemodes;
}

/////////////////// Start of your code ///////////////////

const mapFilePath = process.argv[2];

const originalMapConfig = readFile(mapFilePath);
const mapConfig = removeImages(originalMapConfig);

const result = findSupportedGamemodes(mapConfig);

result["title"] = mapConfig["title"];
result["id"] = mapConfig["mapID"];
console.log(JSON.stringify(result, null, 2));

// uncomment if you need to debug a map
// writeObjectsToFile(
//   mapConfig.objects,
//   `${mapConfig.title.replace(/ /g, "_")}-objects.json`
// );
