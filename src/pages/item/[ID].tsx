import { useEffect, useState } from "react";
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

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

const SukiyaWallsID = 38954;
const SharkBowID = 21792;

const IronIngot = 5057;

export default function ItemPage() {
  const router = useRouter();
  const [item, _setItem] = useState<{ ID: string; Name: string }>();
  const [recipe, _setRecipe] = useState<Recipe>({} as Recipe);
  const [marketInfo, SetMarketInfo] = useState<ItemMarketInfo>();

  useEffect(() => {
    const ID = router.query.ID as string;
    if (ID != undefined) {
      _setItem({ ID: ID, Name: GetItemName(parseInt(ID)) });
      //console.log(ID);
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

  function CreateTableRecipe(recipe: Recipe) {
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

  function parseMillisecondsIntoReadableTime(milliseconds: number): string {
    //Get hours from milliseconds
    var hours = milliseconds / (1000 * 60 * 60);
    var absoluteHours = Math.floor(hours);
    var h = absoluteHours > 9 ? absoluteHours : "0" + absoluteHours;

    //Get remainder from hours and convert to minutes
    var minutes = (hours - absoluteHours) * 60;
    var absoluteMinutes = Math.floor(minutes);
    var m = absoluteMinutes > 9 ? absoluteMinutes : "0" + absoluteMinutes;

    //Get remainder from minutes and convert to seconds
    var seconds = (minutes - absoluteMinutes) * 60;
    var absoluteSeconds = Math.floor(seconds);
    var s = absoluteSeconds > 9 ? absoluteSeconds : "0" + absoluteSeconds;

    return h + "h " + m + "m " + s + "s";
  }

  function getStandardDeviation(array: Array<number>, quatity: number) {
    const n = quatity;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(
      array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
    );
  }

  function CreateMarketInfoTable(marketInfo: ItemMarketInfo | undefined) {
    if (marketInfo == undefined || marketInfo.listings == undefined)
      return <table></table>;
    const quantForSale = marketInfo.listings.reduce(
      (sum: number, currentValue) => sum + currentValue.quantity,
      0
    );
    let lastWeekUnitVolume = 0;
    let lastWeekGilVolume = 0;
    let lastWeekAvgTimeOnMarket: Array<{
      totalTimeOnMarket: number;
      numSales: number;
    }> = Array(7).fill({
      totalTimeOnMarket: 0,
      numSales: 0,
    });
    const now = new Date(Date.now());
    const lastWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 7
    );

    const lastWeekListings = marketInfo.recentHistory.filter((sale) => {
      const adjustedTime = sale.timestamp * 1000;
      return adjustedTime > lastWeek.getTime();
    });

    //console.log(lastWeek);

    lastWeekListings.forEach((sale) => {
      lastWeekUnitVolume += sale.quantity;
      lastWeekGilVolume += sale.pricePerUnit * sale.quantity;
      const adjustedTime = sale.timestamp * 1000;
      // const saleDate = new Date(adjustedTime);
      // const daysAgo = new Date(now.getTime() - adjustedTime).getDate() - 1;
      // lastWeekAvgTimeOnMarket[daysAgo].totalTimeOnMarket +=
      //   lastWeekAvgTimeOnMarket[daysAgo].numSales++;
      // //console.log(`Sale Date: ${saleDate} = Days: ${daysAgo}`);
    });

    const avgSecOnMarket =
      marketInfo.listings.reduce(
        (timeOnMarket: number, currentValue) =>
          timeOnMarket + currentValue.lastReviewTime * 1000,
        0
      ) / marketInfo.listings.length;
    const daysAgo = now.getTime() - avgSecOnMarket;

    return (
      <table className="p-20 border-2 bg-gray-500">
        <thead>
          <tr className="p-20 border-2">
            <th>Quant. for Sale</th>
            <th>Lowest Price</th>
            <th>Avg Sale Price</th>
            <th>Avg Listing Price</th>
            <th>Standard Deviation</th>
            <th>Weekly Sales</th>
            <th>Standard Deviation</th>
            <th>Gil Trading Volume</th>
            <th>Supply Ratio</th>
            <th>Average Hours on Market</th>
          </tr>
        </thead>
        <tbody className="m-20">
          <tr className="text-center">
            <td>{quantForSale.toLocaleString()}</td>
            <td>{marketInfo.minPrice.toLocaleString()}</td>
            <td>{marketInfo.averagePrice.toFixed(2).toLocaleString()}</td>
            <td>
              {marketInfo.currentAveragePrice.toFixed(2).toLocaleString()}
            </td>
            <td>
              {getStandardDeviation(
                marketInfo.listings.map((listing) => listing.total),
                quantForSale
              ).toFixed(2)}
            </td>
            <td>{lastWeekUnitVolume.toLocaleString()}</td>
            <td>
              {getStandardDeviation(
                lastWeekListings.map(
                  (listing) => listing.pricePerUnit * listing.quantity
                ),
                lastWeekUnitVolume
              ).toFixed(2)}
            </td>
            <td>{lastWeekGilVolume.toLocaleString()}</td>
            <td>{(quantForSale / lastWeekUnitVolume).toFixed(2)}</td>
            <td>{parseMillisecondsIntoReadableTime(daysAgo)}</td>
          </tr>
        </tbody>
      </table>
    );
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
              onClick={() => GetItemMarketData(recipe.result.ID)}
            >
              Get Item Price
            </button>
          </div>
          <br />
          <div className="mb-5 mt-10">
            <h2 className="mb-2 text-2xl">
              {item != undefined ? item.Name : ""}
            </h2>
            {CreateMarketInfoTable(marketInfo)}
          </div>
          <br />
          <div className="mb-5 mt-10">
            {/* <Plot
              data={[
                {
                  x: [1, 2, 3],
                  y: [2, 6, 3],
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "red" },
                },
                { type: "bar", x: [1, 2, 3], y: [2, 5, 3] },
              ]}
              layout={{ width: 600, height: 250, title: "A Fancy Plot" }}
              config={{ displayModeBar: false }}
            /> */}
            {CreateHistoryChart(marketInfo?.recentHistory)}
          </div>
        </div>
        <div className="col-span-1" />
        <div className="col-span-5 px-20 py-10">
          {CreateTableRecipe(recipe)}
          {CreateProfitInfo()}
        </div>
      </div>
    </div>
  );
}
