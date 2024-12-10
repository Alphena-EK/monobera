import { bgtClient } from "@bera/graphql";
import {
  GetAllValidatorBlockCount,
  GetAllValidatorBlockCountQueryVariables,
  type GetAllValidatorBlockCountQuery,
} from "@bera/graphql/pol/subgraph";

import { type BeraConfig } from "~/types";

export const getValidatorAllBlockStats = async ({
  config,
  timestamp,
}: {
  config: BeraConfig;
  timestamp: number;
}): Promise<GetAllValidatorBlockCountQuery | undefined> => {
  try {
    if (!config.subgraphs?.polSubgraph) {
      throw new Error("pol subgraph uri is not found in config");
    }

    const result = await bgtClient.query<
      GetAllValidatorBlockCountQuery,
      GetAllValidatorBlockCountQueryVariables
    >({
      query: GetAllValidatorBlockCount,
      variables: {
        timestamp: timestamp.toString(),
      },
    });

    return result.data;
  } catch (e) {
    console.error("getValidatorAllBlockStats:", e);
    return undefined;
  }
};
