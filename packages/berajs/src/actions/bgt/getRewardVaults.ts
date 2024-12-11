import { bexApiGraphqlClient } from "@bera/graphql";
import {
  ApiVaultFragment,
  GetVaultsDocument,
  GetVaultsQuery,
  GetVaultsQueryVariables,
} from "@bera/graphql/pol/api";
import { Address } from "viem";

import { BeraConfig, Gauge } from "~/types";

export interface GetGaugeData {
  gaugeCounts: number;
  gaugeList: ApiVaultFragment[];
  gaugeDictionary: {
    [key: Address]: ApiVaultFragment;
  };
}

/**
 * @deprecated use `GetVaultsQueryVariables['where']` instead
 */
export interface GaugeFilter {
  validatorId?: Address;
  filterByProduct?: string[];
  coinbase?: Address;
  sortBy?: "allTimeBGTReceived" | "amountstaked" | "bgtInflationCapture";
  sortOrder?: "asc" | "desc";
  query?: string;
  page?: number;
  pageSize?: number;
}

export const getRewardVaults = async (
  config: BeraConfig,
  filter?: GetVaultsQueryVariables,
): Promise<GetGaugeData> => {
  const res = await bexApiGraphqlClient.query<
    GetVaultsQuery,
    GetVaultsQueryVariables
  >({
    query: GetVaultsDocument,
    variables: filter,
  });

  if (res.error) {
    throw res.error;
  }

  const vaults = res.data.polGetRewardVaults;

  return {
    gaugeCounts: vaults.length,
    gaugeList: vaults,
    gaugeDictionary: vaults.reduce(
      (acc: { [key: Address]: ApiVaultFragment }, item) => {
        acc[item.vaultAddress as Address] = item;
        return acc;
      },
      {},
    ),
  };
};
