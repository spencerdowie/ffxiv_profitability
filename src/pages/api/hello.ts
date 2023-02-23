import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import { parse } from "csv-parse";
import recipes from "../../../data/Recipe.json";
const dataPath = path.join(process.cwd(), "data");

// const headers =
//   "ID,Number,CraftType,RecipeLevelTable,Item{Result},Amount{Result},Item{Ingredient}[0],Amount{Ingredient}[0],Item{Ingredient}[1],Amount{Ingredient}[1],Item{Ingredient}[2],Amount{Ingredient}[2],Item{Ingredient}[3],Amount{Ingredient}[3],Item{Ingredient}[4],Amount{Ingredient}[4],Item{Ingredient}[5],Amount{Ingredient}[5],Item{Ingredient}[6],Amount{Ingredient}[6],Item{Ingredient}[7],Amount{Ingredient}[7],Item{Ingredient}[8],Amount{Ingredient}[8],Item{Ingredient}[9],Amount{Ingredient}[9],RecipeNotebookList,IsSecondary,MaterialQualityFactor,DifficultyFactor,QualityFactor,DurabilityFactor,RequiredQuality,RequiredCraftsmanship,RequiredControl,QuickSynthCraftsmanship,QuickSynthControl,SecretRecipeBook,Quest,CanQuickSynth,CanHq,ExpRewarded,Status{Required},Item{Required},IsSpecializationRequired,IsExpert,,,PatchNumber";
type Recipe = {
  resultItem: number;
  resultAmount: number;
  ingredients: Array<{ item: number; amount: number }>;
};
// let dataArray: Array<any>;
// fs.readFile(dataPath + "/Recipe.csv", "utf8").then((raw) => {
//   parse(
//     raw,
//     { from_line: 4, columns: headers.split(",") },
//     (err, inData: Array<any>) => (dataArray = inData)
//   );
// });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // //console.log(dataArray?.at(0));
  //createReverseRecipeJSON();
  res.status(200).json({ Error: "Nothing here" });
}

// function createReverseRecipeJSON() {
//   let jsonData: { [ID: number]: Array<number> } = {};

//   Object.values(recipes).forEach((recipe) => {
//     {
//       recipe.ingredients.forEach((ingredient) => {
//         if (jsonData[ingredient.item] == undefined) {
//           jsonData[ingredient.item] = [recipe.resultItem];
//         } else {
//           jsonData[ingredient.item].push(recipe.resultItem);
//         }
//       });
//     }
//   });
//   console.log(jsonData[5111]);

//   fs.writeFile(
//     dataPath + "/ReverseRecipeLookup.json",
//     JSON.stringify(jsonData)
//   );
// }

// function createRecipeJSON() {
//   let jsonData: { [ID: number]: Recipe } = {};
//   if (dataArray == undefined) return;
//   dataArray.forEach((recipe) => {
//     {
//       if (recipe["Item{Result}"] > 0) {
//         jsonData[recipe.ID] = {} as Recipe;
//         let ingredientArray = [] as Array<{ item: number; amount: number }>;
//         let fieldArray = Object.values<any>(recipe);
//         //console.log(fieldArray);
//         for (let i = 6; i < 26; i += 2) {
//           let ingItem = parseInt(fieldArray.at(i) ?? "-1");
//           let ingAmt = parseInt(fieldArray.at(i + 1) ?? "-1");
//           if (ingItem > 0) {
//             ingredientArray.push({
//               item: ingItem,
//               amount: ingAmt,
//             });
//           }
//         }

//         jsonData[recipe.ID] = {
//           resultItem: parseInt(recipe["Item{Result}"]),
//           resultAmount: parseInt(recipe["Amount{Result}"]),
//           ingredients: ingredientArray,
//         };
//       }
//     }
//   });
//   console.log(jsonData[43]);

//   fs.writeFile(dataPath + "/Recipe.json", JSON.stringify(jsonData));
// }
