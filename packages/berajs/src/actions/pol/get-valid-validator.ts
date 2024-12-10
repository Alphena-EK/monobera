import { bgtClient } from "@bera/graphql";
import {
  GetValidValidator,
  GetValidatorBgtBoostQueryVariables,
  type GetValidValidatorQuery,
} from "@bera/graphql/pol/subgraph";
import { isAddress, type Address } from "viem";

import { BeraConfig } from "~/types";

export const getValidValidator = async ({
  config,
  address,
}: {
  config: BeraConfig;
  address: Address;
}): Promise<boolean | undefined> => {
  try {
    if (!config.subgraphs?.polSubgraph) {
      throw new Error("pol subgraph uri is not found in config");
    }

    const result = await bgtClient.query<
      GetValidValidatorQuery,
      GetValidatorBgtBoostQueryVariables
    >({
      query: GetValidValidator,
      variables: { address: address.toLowerCase() },
    });

    if (isAddress(result?.data?.validator?.id)) {
      return true;
    }
    return false;
  } catch (e) {
    console.error("getValidValidator:", e);
    return undefined;
  }
};
