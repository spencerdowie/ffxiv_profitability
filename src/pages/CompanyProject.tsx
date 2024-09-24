import React, { useEffect, useState } from "react";
import { Inter } from "@next/font/google";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import CompanyCraftSequenceLookup from "../../data/CompanyCraftSequenceLookup.json";
import CompanyCraftSequences from "../../data/CompanyCraftSequence.json";
import CompanyCraftParts from "../../data/CompanyCraftPart.json";
import CompanyCraftProcesses from "../../data/CompanyCraftProcess.json";
import CompayCraftSupplyItems from "../../data/CompanyCraftSupplyItem.json";
import recipes from "../../data/Recipe.json";
import recipeLookup from "../../data/RecipeLookup.json";
import {
  CompanyCraftPart,
  CompanyCraftProcess,
  CompanyCraftSequence,
  ItemMarketInfo,
  SupplyItem,
} from "@/types";
import {
  GetItemName,
  GetMarketData,
  GetMinPrices,
  priceFormatOptions,
  priceFormatOptionsSlim,
} from "@/utils/marketDataHelpers";
import MarketInfoTable from "@/components/marketInfoTable";
import Link from "next/link";

const SukiyaWallsID = 38954;
const SharkBowID = 21792;
const SharkBridgeID = 21793;

function GetItemsFromSequence(sequence: CompanyCraftSequence) {
  let itemIDs: Array<string> = [];
  if (sequence == undefined) return itemIDs;
  sequence.craftParts.forEach((craftPartID) =>
    (
      CompanyCraftParts[craftPartID as keyof {}] as CompanyCraftPart
    ).craftProcess.forEach((craftProcessID) =>
      (
        CompanyCraftProcesses[craftProcessID as keyof {}] as CompanyCraftProcess
      ).supplyItems.forEach(({ supplyItem }) => {
        const itemID: string = CompayCraftSupplyItems[supplyItem as keyof {}];
        if (!itemIDs.includes(itemID)) itemIDs.push(itemID);
      })
    )
  );
  return itemIDs;
}

export default function CompanyProject() {
  const [craftSequence, _setCraftSequence] = useState<CompanyCraftSequence>();
  const [resultItemMarketInfo, _setMarketInfo] = useState<ItemMarketInfo>();
  const [ingredientMinPrices, _setIngredientMinPrices] = useState<{
    [ID: string]: { minPrice: number };
  }>();
  const [ingredientTotalPrices, _setIngredientTotalPrices] =
    useState<number[]>();
  const [materialList, _setMaterialList] = useState<{
    [itemID: string]: number[];
  }>({});
  const [numberOfSteps, setNumberOfSteps] = useState<number[]>([]);

  useEffect(() => {
    let sequenceID = CompanyCraftSequenceLookup[SharkBowID];
    let sequence: CompanyCraftSequence =
      CompanyCraftSequences[sequenceID as keyof {}];
    _setCraftSequence(sequence);
    GetMarketData([sequence.resultItem.toString()]).then((marketInfo) =>
      _setMarketInfo(marketInfo[0])
    );
    const sequencesItems = GetItemsFromSequence(sequence);
    console.log(sequencesItems);

    GetMinPrices(sequencesItems).then((minPrices) => {
      _setIngredientMinPrices(minPrices);
      const minPriceItems = minPrices && Object.keys(minPrices);

      let matList = {} as {
        [itemID: string]: number[];
      };
      var totalPrices: number[] = [0];
      let numParts: number[] = [];
      sequence.craftParts.forEach((craftPartID) => {
        let numSteps = 0;
        (
          CompanyCraftParts[craftPartID as keyof {}] as CompanyCraftPart
        ).craftProcess.forEach((craftProcessID, processIndex) => {
          numSteps++;
          (
            CompanyCraftProcesses[
              craftProcessID as keyof {}
            ] as CompanyCraftProcess
          ).supplyItems.forEach(({ supplyItem, setQuantity, setsRequired }) => {
            const itemID: string =
              CompayCraftSupplyItems[supplyItem as keyof {}];

            const totalAmount = setQuantity * setsRequired;

            const minPrice =
              ingredientMinPrices != undefined &&
              minPriceItems?.includes(itemID)
                ? ingredientMinPrices[itemID as keyof {}]?.minPrice
                : -100;

            totalPrices.push(minPrice * totalAmount);

            GetBaseMaterial(parseInt(itemID), totalAmount).forEach(
              ({ item, amount }) => {
                if (item == 4)
                  console.log("Item: %d - Amount: %d", item, amount);
                //console.log("Item: %d - Amount: %d", item, amount);
                if (matList[item] != undefined) {
                  //console.log("Item in list.");
                  if (matList[item][processIndex] != undefined) {
                    //console.log("Item in step.");
                    matList[item][processIndex] =
                      matList[item][processIndex] + amount;
                  } else {
                    matList[item][processIndex] = amount;
                  }
                } else {
                  //console.log("Item not in list.");
                  matList[item] = [processIndex];
                  matList[item][processIndex] = amount;
                }
              }
            );
          });
        });
        numParts.push(numSteps);
      });
      setNumberOfSteps(numParts);
      _setMaterialList(matList);
      _setIngredientTotalPrices(totalPrices);
    });
  }, []);

  function CreateCraftProjectTable() {
    if (craftSequence == undefined) return <div></div>;
    const minPriceItems =
      ingredientMinPrices && Object.keys(ingredientMinPrices);
    return (
      <div className="cols-span-1 w-fit pr-10 mb-32 overflow-y-auto">
        {craftSequence.craftParts.map((craftPartID, partIndex) => (
          <ul key={craftPartID}>
            <li>
              <h2 className="text-xl font-bold">{`Part ${partIndex + 1}`}</h2>
            </li>
            <hr />
            {CreateStepTable(craftPartID, minPriceItems)}
          </ul>
        ))}
      </div>
    );
  }

  function CreateStepTable(
    craftPartID: number,
    minPriceItems: string[] | undefined
  ) {
    return (
      CompanyCraftParts[craftPartID as keyof {}] as CompanyCraftPart
    ).craftProcess.map((craftProcessID, processIndex) => {
      let totalStepCost = 0;
      return (
        <li key={craftProcessID}>
          <h2>{`Step ${processIndex + 1}`}</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th>Item</th>
                <th>Total Amount</th>
                <th>Price per Item</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {(
                CompanyCraftProcesses[
                  craftProcessID as keyof {}
                ] as CompanyCraftProcess
              ).supplyItems
                .map(({ supplyItem, setQuantity, setsRequired }) => {
                  const itemID = CompayCraftSupplyItems[supplyItem as keyof {}];
                  const totalAmount = setQuantity * setsRequired;
                  const minPrice =
                    ingredientMinPrices != undefined &&
                    minPriceItems?.includes(itemID)
                      ? ingredientMinPrices[itemID as keyof {}].minPrice
                      : -100;
                  const itemTotal = minPrice * totalAmount;
                  totalStepCost += itemTotal;
                  return (
                    <tr key={itemID}>
                      <td>
                        <Link href={"../item/" + itemID}>
                          {GetItemName(itemID)}
                        </Link>
                      </td>
                      <td className="text-center">{totalAmount}</td>
                      <td className="text-right">
                        {minPrice.toLocaleString(
                          "en-CA",
                          priceFormatOptionsSlim
                        )}
                      </td>
                      <td className="text-right">
                        {itemTotal.toLocaleString(
                          "en-CA",
                          priceFormatOptionsSlim
                        )}
                      </td>
                    </tr>
                  );
                })
                .concat(
                  <tr key={craftProcessID} className="bg-gray-500">
                    <td>Step Total</td>
                    <td></td>
                    <td></td>
                    <td className="text-right">
                      {totalStepCost.toLocaleString(
                        "en-CA",
                        priceFormatOptionsSlim
                      )}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </li>
      );
    });
  }

  function CreateProfitInfo() {
    if (resultItemMarketInfo == undefined || ingredientTotalPrices == undefined)
      return null;
    let totalCraftCost = Object.values(ingredientTotalPrices).reduce(
      (sum, curValue) => {
        //console.log("Value of " + curValue + ": " + curValue);
        return sum + curValue;
      },
      0
    );
    return (
      <div className="col-span-1">
        <h2 className="text-xl font-bold">Profits:</h2>
        <h4>{`Total Price to Craft: ${totalCraftCost.toLocaleString(
          "en-CA",
          priceFormatOptionsSlim
        )}`}</h4>
        <h4>
          {`Profit/Loss: ${(
            resultItemMarketInfo.minPrice - totalCraftCost
          ).toLocaleString("en-CA", priceFormatOptionsSlim)}`}
        </h4>
        <h4>
          {`ROI: ${(
            (resultItemMarketInfo.minPrice - totalCraftCost) /
            totalCraftCost
          ).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        </h4>
      </div>
    );
  }

  function CreateMaterialList() {
    if (materialList == undefined) return <div></div>;
    let stepHeadings = [];
    for (let step = 1; step <= numberOfSteps[0]; step++) {
      stepHeadings.push(<th>{"Step " + step}</th>);
    }
    return (
      <div className="cols-span-1 w-fit pr-10 mb-32 overflow-y-auto">
        <ul>
          <table className="w-full">
            <thead>
              <tr>
                <th>Item</th>
                {stepHeadings}
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(materialList).map((ID) => {
                let itemID = parseInt(ID);
                let totalNeeded = 0;
                let amountNeeded = [];
                for (let step = 0; step < numberOfSteps[0]; step++) {
                  let amount = materialList[ID as keyof {}][step] ?? 0;
                  if (itemID == 4)
                    console.log("Item: %d - Amount: %d", itemID, amount);
                  totalNeeded += amount;
                  amountNeeded.push(
                    <td key={step} className="text-center">
                      {amount}
                    </td>
                  );
                }
                return (
                  <tr key={itemID}>
                    <td>
                      <Link href={"../item/" + itemID}>
                        {GetItemName(itemID)}
                      </Link>
                    </td>
                    {amountNeeded}
                    <td>{totalNeeded}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ul>
      </div>
    );
  }

  function GetBaseMaterial(
    itemID: number,
    itemCount: number
  ): Array<{ item: number; amount: number }> {
    let recipeExists = recipeLookup[itemID as keyof {}] != undefined;

    if (recipeExists) {
      let recipe = recipes[recipeLookup[itemID as keyof {}][0]["recipe"]] as {
        resultAmount: number;
        ingredients: Array<{ item: number; amount: number }>;
      };
      let craftsNeeded = itemCount / recipe.resultAmount;
      let matList = recipe.ingredients
        .map((ingredient) =>
          GetBaseMaterial(ingredient.item, ingredient.amount * craftsNeeded)
        )
        .reduce((matList, material) => matList.concat(material), []);
      //console.log(matList);
      return matList;
    } else {
      //console.log([{ item: itemID, amount: itemCount }]);
      return [{ item: itemID, amount: itemCount }];
    }
  }

  if (craftSequence == undefined) {
    return (
      <div className="h-full w-full" id="companyProject">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="w-full h-full" id="companyProject">
      <div className="w-full pt-10 px-20 space-y-3 h-full">
        <h2 className="text-2xl font-bold">
          {GetItemName(craftSequence.resultItem)}
        </h2>
        {resultItemMarketInfo && (
          <MarketInfoTable marketInfo={resultItemMarketInfo} />
        )}
        <div className="grid grid-cols-3 h-full">
          {CreateProfitInfo()}
          {CreateCraftProjectTable()}
          {CreateMaterialList()}
        </div>
      </div>
    </div>
  );
}
