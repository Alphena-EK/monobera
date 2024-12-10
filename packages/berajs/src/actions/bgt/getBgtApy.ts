import { beraTokenAddress, honeyTokenAddress } from "@bera/config";
import { bexSubgraphClient, bgtClient } from "@bera/graphql";
import { GetTokenInformation } from "@bera/graphql/dex/subgraph";
import {
  GetGlobalCuttingBoard,
  GetGlobalCuttingBoardQueryResult,
  GetGlobalCuttingBoardQueryVariables,
  type GetGlobalCuttingBoardQuery,
} from "@bera/graphql/pol/subgraph";
import { Address } from "viem";

import { BeraConfig } from "~/types/global";

interface GetBgtApyArgs {
  receiptTokenAddress: Address | undefined;
  tvlInHoney: number | undefined;
  config: BeraConfig;
  blockTime: number;
}

/**
 * fetch the current honey price of a given token
 */

export const getBgtApy = async ({
  receiptTokenAddress,
  tvlInHoney,
  config,
  blockTime,
}: GetBgtApyArgs): Promise<string | undefined> => {
  if (!config.subgraphs?.polSubgraph) {
    throw new Error("bgt subgraph uri is not found in config");
  }

  if (!receiptTokenAddress) {
    return undefined;
  }
  if (!tvlInHoney || tvlInHoney === 0 || !Number.isFinite(tvlInHoney)) {
    return undefined;
  }

  const beraHoneyPrice = await bexSubgraphClient
    .query({
      query: GetTokenInformation,
      variables: {
        asset: beraTokenAddress.toLowerCase(),
        pricingAsset: honeyTokenAddress.toLowerCase(),
      },
    })
    .then((res: any) => {
      return res.data.tokenPrices?.[0]?.price ?? "0";
    })
    .catch((e: any) => {
      console.log(e);
      return "0";
    });

  const apyInfo: GetGlobalCuttingBoardQueryResult | undefined = await bgtClient
    .query<GetGlobalCuttingBoardQuery, GetGlobalCuttingBoardQueryVariables>({
      query: GetGlobalCuttingBoard,
    })
    .then((res: any) => {
      return res;
    })
    .catch((e: any) => {
      console.log(e);
      return undefined;
    });

  console.log("apyInfo", beraHoneyPrice, apyInfo);
  if (!apyInfo) return "0";

  const globalRewardRate =
    parseFloat(apyInfo.data?.globalInfos?.[0].baseRewardRate ?? "0") +
    parseFloat(apyInfo.data?.globalInfos?.[0].rewardRate ?? "0");

  const totalBgtStaked = parseFloat(
    apyInfo.data?.globalInfos?.[0].totalBGTStaked ?? "0",
  );

  const selectedCuttingBoard = apyInfo.data?.globalRewardAllocations.find(
    (cb: any) =>
      cb.vault.stakingToken.id.toLowerCase() ===
      receiptTokenAddress.toLowerCase(),
  );

  if (!selectedCuttingBoard) return "0";

  if (selectedCuttingBoard.amount === "0") return "0";

  const estimatedBgtPerBlock =
    (parseFloat(selectedCuttingBoard.amount) / totalBgtStaked) *
    globalRewardRate;

  const secondsInAYear = 60 * 60 * 24 * 365;
  const blocksPerSecond = 1 / blockTime;
  const blocksPerYear = secondsInAYear * blocksPerSecond;

  const estimatedBgtPerYear = estimatedBgtPerBlock * blocksPerYear;

  const honeyValueEstimatedBgtPerYear =
    estimatedBgtPerYear * parseFloat(beraHoneyPrice);

  const apy = (honeyValueEstimatedBgtPerYear / tvlInHoney).toString();
  return apy;
};
