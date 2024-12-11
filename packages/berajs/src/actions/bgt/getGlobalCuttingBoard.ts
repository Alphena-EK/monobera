import { BeraConfig } from "~/types";
import { getRewardVaults } from "./getRewardVaults";
import {
  ApiVaultFragment,
  GqlRewardVaultOrderBy,
  GqlRewardVaultOrderDirection,
} from "@bera/graphql/pol/api";

export const getGlobalCuttingBoard = async (
  threshold: number,
  config: BeraConfig,
): Promise<ApiVaultFragment[]> => {
  const { gaugeList } = await getRewardVaults(config, {
    // TODO sort by bgt capture percentage
    orderBy: GqlRewardVaultOrderBy.Apy,
    orderDirection: GqlRewardVaultOrderDirection.Desc,
    pageSize: threshold,
  });
  return gaugeList;
};
