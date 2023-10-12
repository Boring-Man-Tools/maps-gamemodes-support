/**
 * A generic map object that contains properties found in every map object (excluding  "*Config*").
 */
declare type GenericMapObject = {
  ID: string;
  Y: string;
  X: string;
  Name: string;
  ObjIndexID: string;
  ObjIsTile: string;
  Depth: string;
  LogicID: string;
  Poly: string;
  Team: string;
  ObjRotate: string;
};

/** A record of all objects in the maps. */
declare type MapObjects = { [key: string]: GenericMapObject };
/** A record where keys & values are strings. */
declare type Record = { [key: string]: string };

/** Represents the configuration of a map. */
declare type MapConfig = {
  title: string;
  isClimb: boolean;
  mapID: number;
  objects: MapObjects;
  images: Record;
};

/** Info about survival support for a map. */
declare type SurvivalInfo = {
  minimal: boolean;
  classic: boolean;
  hardcore: boolean;
  beacon: boolean;
};

/** Info about supported gamemodes for a map. */
declare type GamemodesInfo = {
  climb: boolean;
  survival: SurvivalInfo;
  deathmatch: boolean;
  teamDeathmatch: boolean;
  weaponDeal: boolean;
  zombrains: boolean;
  takeOver: boolean;
  captureTheFlag: boolean;
};

/**
 * Generated JSON data for a map.
 *
 * Contains info about all gamemodes and the title of the map.
 */
declare type GeneratedMapJSONData = GamemodesInfo & {
  title: string;
  id: number;
};
