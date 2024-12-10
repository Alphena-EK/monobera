import { type GetAllValidatorsQuery } from "@bera/graphql/pol/subgraph";
import { mutate } from "swr";
import useSWRImmutable from "swr/immutable";

import { getAllValidators } from "~/actions/pol";
import { useBeraJs } from "~/contexts";
import { DefaultHookOptions, DefaultHookReturnType } from "~/types";

export const usePollAllValidators = (
  options?: DefaultHookOptions,
): DefaultHookReturnType<GetAllValidatorsQuery | undefined> => {
  const { config: beraConfig } = useBeraJs();
  const config = options?.beraConfigOverride ?? beraConfig;
  const QUERY_KEY = ["usePollValidatorsSubgraph"];
  const swrResponse = useSWRImmutable<GetAllValidatorsQuery | undefined>(
    QUERY_KEY,
    async () => {
      return await getAllValidators({
        config,
      });
    },
    {
      ...options?.opts,
    },
  );

  return {
    ...swrResponse,
    refresh: () => mutate(QUERY_KEY),
  };
};
