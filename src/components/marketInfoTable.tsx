import React, { useEffect, useState } from "react";
import { ItemMarketInfo } from "@/types";
import { getStandardDeviation } from "@/utils/marketDataHelpers";

const headers = (
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
);

export default function MarketInfoTable(props: { marketInfo: ItemMarketInfo }) {
  const [marketInfo, setMarketInfo] = useState<ItemMarketInfo>();
  useEffect(() => {
    console.log("Market Info Updated");
    setMarketInfo(props.marketInfo);
  }, [props.marketInfo]);
  //console.log(marketInfo);
  if (marketInfo == undefined || marketInfo.listings == undefined) return null;

  const now = new Date(Date.now());
  const lastWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 7
  );

  const lastWeekListings =
    marketInfo.recentHistory != undefined
      ? marketInfo.recentHistory.filter((sale) => {
          const adjustedTime = sale.timestamp * 1000;
          return adjustedTime > lastWeek.getTime();
        })
      : 0;

  const avgSecOnMarket =
    marketInfo.listings != undefined
      ? marketInfo.listings.reduce(
          (timeOnMarket: number, currentValue) =>
            timeOnMarket + currentValue.lastReviewTime * 1000,
          0
        ) / marketInfo.listings.length
      : 0;
  const daysAgo = now.getTime() - avgSecOnMarket;

  return (
    <table className="p-20 border-2 bg-gray-500">
      {headers}
      {marketInfo && (
        <tbody className="m-20">
          <tr className="text-center">
            <td>{marketInfo.quantForSale.toLocaleString()}</td>
            <td>
              {marketInfo.minPrice.toLocaleString("en-CA", {
                style: "currency",
                currency: "CAD",
                currencyDisplay: "symbol",
                maximumFractionDigits: 0,
              })}
            </td>
            <td>
              {marketInfo.averagePrice.toLocaleString("en-CA", {
                style: "currency",
                currency: "CAD",
                currencyDisplay: "symbol",
                maximumFractionDigits: 2,
              })}
            </td>
            <td>
              {marketInfo.currentAveragePrice.toLocaleString("en-CA", {
                style: "currency",
                currency: "CAD",
                currencyDisplay: "symbol",
                maximumFractionDigits: 2,
              })}
            </td>
            <td>
              {marketInfo.listings &&
                getStandardDeviation(
                  marketInfo.listings.map((listing) => listing.total),
                  marketInfo.quantForSale
                ).toLocaleString("en-CA", {
                  style: "currency",
                  currency: "CAD",
                  currencyDisplay: "symbol",
                  maximumFractionDigits: 2,
                })}
            </td>
            <td>{marketInfo.lastWeekUnitVolume.toLocaleString()}</td>
            <td>
              {lastWeekListings &&
                getStandardDeviation(
                  lastWeekListings.map(
                    (listing) => listing.pricePerUnit * listing.quantity
                  ),
                  marketInfo.lastWeekUnitVolume
                ).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
            </td>
            <td>
              {marketInfo.lastWeekGilVolume.toLocaleString("en-CA", {
                style: "currency",
                currency: "CAD",
                currencyDisplay: "symbol",
                maximumFractionDigits: 0,
              })}
            </td>
            <td>
              {(
                marketInfo.quantForSale / marketInfo.lastWeekUnitVolume
              ).toFixed(2)}
            </td>
            <td>{parseMillisecondsIntoReadableTime(daysAgo)}</td>
          </tr>
        </tbody>
      )}
    </table>
  );
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
