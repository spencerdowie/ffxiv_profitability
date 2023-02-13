import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import { parse } from "csv-parse";
const dataPath = path.join(process.cwd(), "data");
const recipeLookupHeader = "ID,CRP,BSM,ARM,GSM,LTW,WVR,ALC,CUL";
const recipeHeader =
  "ID,Number,CraftType,RecipeLevelTable,Item{Result},Amount{Result},Item{Ingredient}[0],Amount{Ingredient}[0],Item{Ingredient}[1],Amount{Ingredient}[1],Item{Ingredient}[2],Amount{Ingredient}[2],Item{Ingredient}[3],Amount{Ingredient}[3],Item{Ingredient}[4],Amount{Ingredient}[4],Item{Ingredient}[5],Amount{Ingredient}[5],Item{Ingredient}[6],Amount{Ingredient}[6],Item{Ingredient}[7],Amount{Ingredient}[7],Item{Ingredient}[8],Amount{Ingredient}[8],Item{Ingredient}[9],Amount{Ingredient}[9],RecipeNotebookList,IsSecondary,MaterialQualityFactor,DifficultyFactor,QualityFactor,DurabilityFactor,RequiredQuality,RequiredCraftsmanship,RequiredControl,QuickSynthCraftsmanship,QuickSynthControl,SecretRecipeBook,Quest,CanQuickSynth,CanHq,ExpRewarded,Status{Required},Item{Required},IsSpecializationRequired,IsExpert,,,PatchNumber";

type recipeLookup = {
  ID: number;
  CRP: number;
  BSM: number;
  ARM: number;
  GSM: number;
  LTW: number;
  WVR: number;
  ALC: number;
  CUL: number;
};
const offset: number = 4;
let recipeLookupArray: Array<recipeLookup>;
let recipeArray: Array<any>;

fs.readFile(dataPath + "/RecipeLookup.csv", "utf8").then((lookupData) => {
  parse(
    lookupData,
    { from_line: 4, columns: recipeLookupHeader.split(",") },
    (err, lookup: Array<recipeLookup>) => {
      recipeLookupArray = lookup;
    }
  );
});

fs.readFile(dataPath + "/Recipe.csv", "utf8").then((recipeData) => {
  parse(
    recipeData,
    { from_line: 4, columns: recipeHeader.split(",") },
    (err, recipesRaw: Array<any>) => (recipeArray = recipesRaw)
  );
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.query.ID == undefined) {
    res.status(500).json({ error: "No ID provided" });
  } else {
    const ID = +req.query.ID;

    let lookup: recipeLookup | undefined = recipeLookupArray?.find(
      (recipe) => recipe.ID == ID
    );
    //console.log(lookup);
    if (lookup == undefined) {
      //console.log("Can't find");

      res.status(405).json({ error: "No recipe found for item ID " + ID });
    } else {
      //console.log(lookup);
      let recipes = new Array<any>();
      Object.values(lookup)
        .slice(1)
        .forEach((value) => {
          if (value > 0) {
            if (value > 5591) {
              value -= 24408;
            }
            let rec = recipeArray?.at(value);
            //console.log(rec);
            if (rec != undefined) {
              recipes.push(rec);
            }
          }
        });
      res.status(200).json({ recipes: recipes });
    }
  }
}
