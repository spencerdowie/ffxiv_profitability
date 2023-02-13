import { NextApiRequest, NextApiResponse } from "next";

const MarketUrlBase = "https://universalis.app/api/v2/";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.query.itemIDs == undefined) {
    res.status(500).json({ error: "No ID provided" });
  } else {
    const itemStr = req.query.itemIDs as string;
    const multi = itemStr.includes(",");

    let fields = "";
    if (multi) fields = "?fields=items.minPrice";

    const fieldStr = fields;
    //res.status(200).json(MarketUrlBase + `Behemoth/${itemStr}${fieldStr}`);

    let priceArray: Array<{ ID: number; price: number }> = [];
    await fetch(MarketUrlBase + `Behemoth/${itemStr}${fieldStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (multi) {
          const { items } = data;
          Object.keys(items).forEach((ID) => {
            priceArray.push({ ID: +ID, price: items[ID]["minPrice"] });
          });
          //console.log(priceArray);
          res.status(200).json(priceArray);
        } else {
          fetch(`${MarketUrlBase}history/Behemoth/${itemStr}`)
            .then((res) => res.json())
            .then((history) =>
              res.status(200).json({ ...data, recentHistory: history.entries })
            );
        }
      });
  }
}
