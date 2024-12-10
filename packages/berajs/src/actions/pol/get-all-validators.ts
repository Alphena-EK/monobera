import { bgtClient } from "@bera/graphql";
import {
  GetAllValidators,
  GetAllValidatorsQueryVariables,
  type GetAllValidatorsQuery,
} from "@bera/graphql/pol/subgraph";

import { type BeraConfig } from "~/types";

export const getAllValidators = async ({
  config,
}: {
  config: BeraConfig;
}): Promise<GetAllValidatorsQuery | undefined> => {
  try {
    if (!config.subgraphs?.polSubgraph) {
      throw new Error("pol subgraph uri is not found in config");
    }

    const result = await bgtClient.query<
      GetAllValidatorsQuery,
      GetAllValidatorsQueryVariables
    >({
      query: GetAllValidators,
    });

    return result.data;
  } catch (e) {
    console.error("getAllValidators:", e);
    return undefined;
  }
};
