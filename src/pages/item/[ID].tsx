import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Inter } from "@next/font/google";

import {
  ItemMarketInfo,
  SaleView,
  CurrentlyShownView,
  RecipeItem,
  Recipe,
  histArr,
} from "@/types";
import { GetMarketData, GetItemName } from "@/utils/marketDataHelpers";

import recipes from "../../../data/Recipe.json";
import recipeLookup from "../../../data/RecipeLookup.json";
import reverseRecipeLookup from "../../../data/ReverseRecipeLookup.json";
import MarketInfoTable from "@/components/marketInfoTable";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

const SukiyaWallsID = 38954;
const SharkBowID = 21792;

const IronIngot = 5057;

export default function ItemPage() {
  const router = useRouter();
  const [itemID, _setItemID] = useState<number>(-1);
  const [item, _setItem] = useState<{ ID: string; Name: string }>();
  const [recipe, _setRecipe] = useState<Recipe>({} as Recipe);
  const [marketInfo, SetMarketInfo] = useState<ItemMarketInfo>();

  useEffect(() => {
    const ID = router.query.ID as string;
    if (ID != undefined) {
      _setItemID(parseInt(ID));
      _setItem({ ID: ID, Name: GetItemName(parseInt(ID)) });
      //console.log(ID);
      let recipeExists = recipeLookup[ID as keyof {}] != undefined;
      if (recipeExists)
        SetRecipe(recipes[recipeLookup[ID as keyof {}][0]["recipe"]]);
      // fetch("/api/recipe/" + ID).then((res) => {
      //   if (res.ok) {
      //     res.json().then((data) => {
      //       SetRecipeRaw(data["recipes"][0]);
      //     });
      //   } else {
      //     res.json().then(({ error }) => {
      //       console.error(error);
      //     });
      //   }
      // });
    }
  }, [router.query]);

  function SetRecipeRaw(recipeRaw: any) {
    //console.log("Setting recipe");
    let resultID = recipeRaw["Item{Result}"];
    let recipe: Recipe = {
      ID: recipeRaw["ID"],
      ingredients: {},
      result: {
        ID: resultID,
        name: GetItemName(resultID),
        quantity: recipeRaw["Amount{Result}"],
        price: -1,
        total: -1,
      },
      craftCost: -1,
      craftCostNoCrystal: -1,
      price: -1,
    };

    if (recipe.ingredients == undefined) return;

    for (let i = 0; i < 10; i++) {
      //console.log(recipeRaw[`Amount{Ingredient}[${i}]`]);
      const item: RecipeItem = {
        quantity: recipeRaw[`Amount{Ingredient}[${i}]`],
        ID: -1,
        name: "",
        price: -1,
        total: -1,
      };
      if (item.quantity > 0) {
        let matID = recipeRaw[`Item{Ingredient}[${i}]`];
        item.ID = matID;
        item.name = GetItemName(matID);
        //console.log(itemData);
        recipe.ingredients[item.ID] = item;
      }
    }
    //console.log(recipe);
    _setRecipe(recipe);
  }

  function SetRecipe(newRecipe: {
    resultItem: number;
    resultAmount: number;
    ingredients: Array<{ item: number; amount: number }>;
  }) {
    //console.log("Setting recipe");
    let recipe: Recipe = {
      ID: 0,
      ingredients: {},
      result: {
        ID: newRecipe.resultItem,
        name: GetItemName(newRecipe.resultItem),
        quantity: newRecipe.resultAmount,
        price: -1,
        total: -1,
      },
      craftCost: -1,
      craftCostNoCrystal: -1,
      price: -1,
    };

    let ingredients = {} as { [ID: number]: RecipeItem };

    newRecipe.ingredients.forEach((ingredient) => {
      const item: RecipeItem = {
        quantity: ingredient.amount,
        ID: ingredient.item,
        name: GetItemName(ingredient.item),
        price: -1,
        total: -1,
      };
      ingredients[item.ID] = item;
    });

    recipe.ingredients = ingredients;

    //console.log(recipe);
    _setRecipe(recipe);
  }

  function SetRecipePrices(
    priceArray: Array<{ ID: number; price: number }>
  ): Recipe | null {
    let newRecipe = { ...recipe };
    let craftCost = 0;
    let craftCostNoCrystal = 0;
    if (newRecipe.ingredients == undefined) return null;
    let items = newRecipe.ingredients;
    priceArray.forEach(({ ID, price }) => {
      if (items[ID] == undefined) {
        return;
      }
      items[ID].price = price;
      let total = items[ID].quantity * price;
      items[ID].total = total;
      craftCost += total;
      if (ID > 20) craftCostNoCrystal += total;
    });
    newRecipe.ingredients = items;
    newRecipe.craftCost = craftCost;
    newRecipe.craftCostNoCrystal = craftCostNoCrystal;
    let itemPrice = priceArray.find(
      ({ ID }) => newRecipe.result.ID == ID
    )?.price;
    if (itemPrice) {
      newRecipe.price = itemPrice;
    }
    return newRecipe;
  }

  function CreateTableRecipe() {
    //console.log(recipe);
    if (recipe.ingredients == undefined) return null;

    const profit = recipe.price - recipe.craftCost;
    return (
      <table className="p-20 border-2 bg-gray-500">
        <thead>
          <tr className="p-20 border-2">
            <th>Item</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Increase in Value</th>
          </tr>
        </thead>
        <tbody className="m-20">
          {Object.entries(recipe.ingredients).map(([ID, item]) => {
            const profitAdded = profit * (item.total / recipe.craftCost);
            return (
              <tr key={ID} className="text-center">
                <td>
                  <Link href={item.ID.toString()}>{item.name}</Link>
                </td>
                <td>{item.quantity}</td>
                <td>{item.price.toLocaleString()}</td>
                <td>{item.total.toLocaleString()}</td>
                <td>{profitAdded.toFixed(2).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  function GetRecipePricingData(recipe: Recipe) {
    let itemIDs = recipe?.ingredients;
    if (itemIDs == undefined) {
      return;
    } else {
      const itemStr = Object.keys(itemIDs)
        .concat(recipe.result.ID.toString())
        .toString();
      fetch(`../api/marketData?itemIDs=${itemStr}&fields=items.minPrice`)
        .then((res) => res.json())
        .then((data) => {
          const { items } = data;
          let testArray = Object.keys(items).map((ID) => {
            return { ID: +ID, price: items[ID]["minPrice"] };
          });
          //console.log(testArray);
          let newRecipe = SetRecipePrices(testArray);
          if (newRecipe) {
            _setRecipe(newRecipe);
          }
        });
    }
  }

  function GetItemMarketData(ID: number) {
    GetMarketData([ID.toString()]).then((itemMarketInfo) => {
      console.log(itemMarketInfo);
      SetMarketInfo(itemMarketInfo[0]);
    });
  }

  function CreateProfitInfo() {
    if (recipe.craftCost == undefined) return null;
    return (
      <div className="grid grid-cols-2">
        <div id="profit" className="mt-5">
          <h4>w/ Crystals:</h4>
          <h4>{`Total Price to Craft: ${recipe.craftCost.toLocaleString()}`}</h4>
          <h4>
            {`Profit/Loss: ${(
              recipe.price - recipe.craftCost
            ).toLocaleString()}`}
          </h4>
          <h4>
            {`ROI: ${((recipe.price - recipe.craftCost) / recipe.craftCost)
              .toFixed(2)
              .toLocaleString()}`}
          </h4>
        </div>
        <div id="profit-no-crystal" className="mt-5">
          <h4>w/o Crystals:</h4>
          <h4>
            {`Total Price to Craft: ${recipe.craftCostNoCrystal.toLocaleString()}`}
          </h4>
          <h4>
            {`Profit/Loss: ${(
              recipe.price - recipe.craftCostNoCrystal
            ).toLocaleString()}`}
          </h4>
          <h4>
            {`ROI: ${(
              (recipe.price - recipe.craftCostNoCrystal) /
              recipe.craftCostNoCrystal
            )
              .toFixed(2)
              .toLocaleString()}`}
          </h4>
        </div>
      </div>
    );
  }

  function CreateHistoryChart(history: Array<SaleView> | undefined) {
    if (history == undefined) return null;
    const data = history.map((sale) => {
      return {
        price: sale.pricePerUnit,
        quantity: sale.quantity,
        timestamp: sale.timestamp,
      };
    });

    const dateSorted: histArr = data.reduce((acc: histArr, sale) => {
      const date: Date = new Date(sale.timestamp * 1000);
      const key = date.getUTCDate() + "/" + (date.getUTCMonth() + 1);
      const curDate = acc[key] ?? [];
      return {
        ...acc,
        [key]: [...curDate, { price: sale.price, quantity: sale.quantity }],
      };
    }, {});

    const dateArr = Object.keys(dateSorted).reverse();
    const minPriceArr: Array<number> = dateArr.map((date) =>
      Math.min(...dateSorted[date].map((sale) => sale.price))
    );
    const maxPriceArr: Array<number> = dateArr.map((date) =>
      Math.max(...dateSorted[date].map((sale) => sale.price))
    );
    const avgPriceArr: Array<number> = dateArr.map(
      (date) =>
        dateSorted[date]
          .map((sale) => sale.price)
          .reduce((acc: number, price) => acc + price, 0) /
        dateSorted[date].length
    );
    const dailySalesArr: Array<number> = dateArr.map((date) =>
      dateSorted[date]
        .map((sale) => sale.quantity)
        .reduce((acc: number, quantity) => acc + quantity, 0)
    );
    return (
      <Plot
        data={[
          {
            x: dateArr,
            y: dailySalesArr,
            type: "scatter",
            //mode: "lines+markers",
            line: { color: "purple", shape: "hv" },
            name: "Quantity",
            fill: "tozeroy",
          },
          {
            x: dateArr.concat([...dateArr].reverse()),
            y: maxPriceArr.concat([...minPriceArr].reverse()),
            type: "scatter",
            line: { color: "red" },
            name: "Min/Max Price",
            fill: "tonextx",
            yaxis: "y2",
          },
          // {
          //   x: dateArr,
          //   y: maxPriceArr,
          //   type: "scatter",
          //   marker: { color: "grey" },
          //   name: "Max Price",
          // },
          {
            x: dateArr,
            y: avgPriceArr,
            type: "scatter",
            mode: "lines",
            marker: { color: "blue" },
            name: "Avg Price",
            yaxis: "y2",
            //fill: "tonexty",
          },
          // {
          //   x: dateArr,
          //   y: minPriceArr,
          //   type: "scatter",
          //   marker: { color: "green" },
          //   name: "Min Price",
          //   //fill: "tonexty",
          // },
        ]}
        layout={{
          width: 775,
          height: 400,
          title: "Price History",
          showlegend: true,
          legend: {
            orientation: "h",
          },
          margin: {
            l: 45,

            r: 40,

            b: 75,

            t: 50,

            pad: 4,
          },
          xaxis: {
            //dtick: 7,
            range: [dateArr[0], dateArr[dateArr.length - 1]],
          },
          yaxis: {
            range: [0, Math.max(...dailySalesArr) * 1.15],
            side: "right",
          },
          yaxis2: {
            range: [0, Math.max(...maxPriceArr) * 1.15],
            overlaying: "y",
          },
        }}
        config={{ displayModeBar: false, staticPlot: true }}
      />
    );
  }

  function CreateUsesList() {
    if (item == undefined) return <div />;

    const usedIn: Array<number> = reverseRecipeLookup[item.ID as keyof {}];
    if (usedIn == undefined) return <div />;

    return (
      <ul className="h-96 mt-14 overflow-y-auto bg-gray-500">
        {usedIn.map((recipe) => (
          <li key={recipe}>
            <Link href={recipe.toString()}>{GetItemName(recipe)}</Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="App h-screen w-screen">
      <div className="grid grid-cols-10">
        <div className="col-span-4 grid grid-cols-2 h-20 p-8">
          <div>
            <button
              className="w-1/2 bg-blue-400 rounded-md p-2 text-center"
              onClick={() => GetRecipePricingData(recipe)}
            >
              Get Recipe Prices
            </button>
            <button
              className="w-1/2 bg-blue-400 rounded-md p-2 text-center"
              onClick={() => GetItemMarketData(itemID)}
            >
              Get Item Price
            </button>
          </div>
          <br />
          <div className="mb-5 mt-10">
            <h2 className="mb-2 text-2xl">
              {item != undefined ? item.Name : ""}
            </h2>
            {marketInfo && <MarketInfoTable marketInfo={marketInfo} />}
          </div>
          <br />
          <div className="mb-5 mt-10">
            {CreateHistoryChart(marketInfo?.recentHistory)}
          </div>
        </div>
        <div className="col-span-1" />
        <div className="col-span-5 px-20 py-10">
          {CreateTableRecipe()}
          {CreateProfitInfo()}
          {CreateUsesList()}
        </div>
      </div>
    </div>
  );
}
