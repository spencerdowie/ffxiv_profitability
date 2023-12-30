import React, { useEffect, useState } from "react";
import { Inter } from "@next/font/google";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import CompanyCraftSequenceLookup from "../../data/CompanyCraftSequenceLookup.json";
import CompanyCraftSequences from "../../data/CompanyCraftSequence.json";
import CompanyCraftParts from "../../data/CompanyCraftPart.json";
import CompanyCraftProcesses from "../../data/CompanyCraftProcess.json";
import CompayCraftSupplyItems from "../../data/CompanyCraftSupplyItem.json";
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
  const [ingredientTotalPrices, _setIngredientTotalPrices] = useState<{
    [ID: string]: { totalPrice: number };
  }>();

  useEffect(() => {
    let sequenceID = CompanyCraftSequenceLookup[SukiyaWallsID];
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

      let totalPrices: {
        [ID: string]: { totalPrice: number };
      } = {};
      sequence.craftParts.forEach((craftPartID) =>
        (
          CompanyCraftParts[craftPartID as keyof {}] as CompanyCraftPart
        ).craftProcess.forEach((craftProcessID) =>
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
            totalPrices[itemID] = { totalPrice: minPrice * totalAmount };
          })
        )
      );
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
            {(
              CompanyCraftParts[craftPartID as keyof {}] as CompanyCraftPart
            ).craftProcess.map((craftProcessID, processIndex) => (
              <li key={craftProcessID}>
                <h2>{`Process ${processIndex + 1}`}</h2>
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
                    ).supplyItems.map(
                      ({ supplyItem, setQuantity, setsRequired }) => {
                        const itemID =
                          CompayCraftSupplyItems[supplyItem as keyof {}];
                        const totalAmount = setQuantity * setsRequired;
                        const minPrice =
                          ingredientMinPrices != undefined &&
                          minPriceItems?.includes(itemID)
                            ? ingredientMinPrices[itemID as keyof {}].minPrice
                            : -100;
                        return (
                          <tr key={itemID}>
                            <td>
                              <Link href={"../item/" + itemID}>
                                {GetItemName(itemID)}
                              </Link>
                            </td>
                            <td className="text-center">{totalAmount}</td>
                            <td className="text-right">
                              {minPrice.toLocaleString("en-CA", {
                                style: "currency",
                                currency: "CAD",
                                currencyDisplay: "symbol",
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className="text-right">
                              {(minPrice * totalAmount).toLocaleString(
                                "en-CA",
                                {
                                  style: "currency",
                                  currency: "CAD",
                                  currencyDisplay: "symbol",
                                  maximumFractionDigits: 0,
                                }
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </li>
            ))}
          </ul>
        ))}
      </div>
    );
  }

  function CreateProfitInfo() {
    if (resultItemMarketInfo == undefined || ingredientTotalPrices == undefined)
      return null;
    let totalCraftCost = Object.values(ingredientTotalPrices).reduce(
      (sum, curValue) => sum + curValue.totalPrice,
      0
    );
    return (
      <div className="col-span-1">
        <h2 className="text-xl font-bold">Profits:</h2>
        <h4>{`Total Price to Craft: ${totalCraftCost.toLocaleString("en-CA", {
          style: "currency",
          currency: "CAD",
          currencyDisplay: "symbol",
          maximumFractionDigits: 0,
        })}`}</h4>
        <h4>
          {`Profit/Loss: ${(
            resultItemMarketInfo.minPrice - totalCraftCost
          ).toLocaleString("en-CA", {
            style: "currency",
            currency: "CAD",
            currencyDisplay: "symbol",
            maximumFractionDigits: 0,
          })}`}
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
        </div>
      </div>
    </div>
  );
}
