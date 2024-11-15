import { ApolloClient, InMemoryCache } from "@apollo/client";
import { GetTokenInformations, dexClient } from "@bera/graphql";
import { getAddress } from "viem";

import { BeraConfig, Token } from "~/types";
import { handleNativeBera } from "~/utils";

interface FetchHoneyPricesArgs {
  tokenAddresses?: string[] | undefined;
  config: BeraConfig;
}

export interface TokenHoneyPrices {
  [key: string]: string;
}
/**
 * fetch the current honey prices of a series of tokens
 */

export const getTokenHoneyPrices = async ({
  tokenAddresses,
  config,
}: FetchHoneyPricesArgs): Promise<TokenHoneyPrices | undefined> => {
  if (!config.subgraphs?.dexSubgraph) {
    throw new Error("dex subgraph uri s not found in config");
  }

  if (!tokenAddresses || tokenAddresses.some((token) => token === undefined)) {
    return {};
  }
  const swappedAddresses = tokenAddresses.map((token: string | undefined) =>
    handleNativeBera(token).toLowerCase(),
  );
  try {
    const res = await dexClient.query({
      query: GetTokenInformations,
      variables: {
        id: swappedAddresses,
      },
    });
    return res.data?.tokenInformations.reduce(
      (allPrices: any, tokenInformation: Token) => ({
        ...allPrices,
        [getAddress(tokenInformation.address)]: tokenInformation.usdValue,
      }),
      {},
    ) as TokenHoneyPrices;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
