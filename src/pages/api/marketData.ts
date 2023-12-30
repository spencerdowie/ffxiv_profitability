import { NextApiRequest, NextApiResponse } from "next";

const MarketUrlBase = "https://universalis.app/api/v2";
const region = "Behemoth";

/*fields is passed to universalis api
getHistory will replace recentHistory will full sale history*/
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.query.itemIDs == undefined) {
    res.status(500).json({ error: "No ID provided" });
  } else {
    const itemStr = req.query.itemIDs as string;
    const fieldsStr = "?fields=" + ((req.query.fields as string) ?? "");
    const getHistory = (req.query.getHistory as string) === "true";
    const multi = itemStr.includes(",");

    const itemIDs = itemStr.split(",");

    // console.log(itemIDs);
    // console.log(fieldsStr);
    // console.log(getHistory);

    //const fieldStr = fields;
    //res.status(200).json(MarketUrlBase + `Behemoth/${itemStr}${fieldStr}`);

    await fetch(`${MarketUrlBase}/${region}/${itemStr}${fieldsStr}`)
      .then((res) => res.json())
      .then((data) => {
        //console.log(data);

        if (getHistory) {
          return fetch(`${MarketUrlBase}/history/${region}/${itemStr}`)
            .then((res) => res.json())
            .then((history) => {
              // console.log(
              //   itemIDs.filter(
              //     (ID) => !history.unresolvedItems.includes(parseInt(ID))
              //   )
              // );
              //console.log(history.unresolvedItems);
              if (itemIDs.length > 1) {
                itemIDs
                  .filter(
                    (ID) => !history.unresolvedItems.includes(parseInt(ID))
                  )
                  .forEach((ID) => {
                    //console.log(ID);
                    //console.log(data.items[ID]);
                    //console.log(history.items[ID]);
                    data.items[ID].recentHistory = history.items[ID].entries;
                  });
              } else {
                data.recentHistory = history.entries;
              }
              //console.log(data);
              return res.status(200).json(data);
            });
        } else {
          return res.status(200).json(data);
        }
      });
  }
}
