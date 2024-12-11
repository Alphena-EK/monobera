import { GetValidatorsQuery } from "@bera/graphql/pol/api";
import { mutate } from "swr";
import useSWRImmutable from "swr/immutable";

import { getAllValidators } from "~/actions/pol";
import { useBeraJs } from "~/contexts";
import POLLING from "~/enum/polling";
import { DefaultHookOptions, DefaultHookReturnType } from "~/types";

export const useAllValidators = (
  options?: DefaultHookOptions,
): DefaultHookReturnType<GetValidatorsQuery | undefined> => {
  const { config: beraConfig } = useBeraJs();
  const config = options?.beraConfigOverride ?? beraConfig;
  const QUERY_KEY = config ? ["usePollValidatorsSubgraph"] : null;

  const swrResponse = useSWRImmutable<GetValidatorsQuery | undefined>(
    QUERY_KEY,
    async () => {
      return await getAllValidators({
        config,
      });
    },
    {
      refreshInterval: POLLING.SLOW,
      ...options?.opts,
    },
  );

  return {
    ...swrResponse,
    refresh: () => mutate(QUERY_KEY),
  };
};
