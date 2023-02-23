import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import { parse } from "csv-parse";
import searchLookup from "../../../data/SearchCategoryLookup.json";
const dataPath = path.join(process.cwd(), "data");

const itemHeader = "ID,Name,Icon,Category,Order,ClassJob,";

let itemArray: Array<any>;
fs.readFile(dataPath + "/ItemSearchCategory.csv", "utf8").then((itemData) => {
  parse(
    itemData,
    { from_line: 4, columns: itemHeader.split(",") },
    (err, itemsRaw: Array<any>) => (itemArray = itemsRaw)
  );
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(itemArray?.at(0));
  createJSON();
  res.status(200).json({ Val: itemArray?.at(0) });
}

type ItemSearchCategory = { [ID: number]: string };
type ItemData = { [ID: number]: { Name: string; ItemSearchCategory: number } };

function createJSON() {
  let searchData: ItemSearchCategory = {};
  if (itemArray == undefined) return;
  itemArray
    .filter((item) => searchLookup[item.ID as keyof {}] != undefined)
    .forEach((item) => {
      {
        //console.log(searchLookup[item.ID as keyof {}]);
        searchData[item.ID] = item.Name;
      }
    });
  //console.log(searchData);

  //fs.writeFile(dataPath + "/SearchCategory.json", JSON.stringify(searchData));
}
