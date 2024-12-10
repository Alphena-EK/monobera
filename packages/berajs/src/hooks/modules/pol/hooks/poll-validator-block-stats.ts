import { type GetValidatorBlockStatsQuery } from "@bera/graphql/pol/subgraph";
import { mutate } from "swr";
import useSWRImmutable from "swr/immutable";
import { Address } from "viem";

import { getValidatorBlockStats } from "~/actions";
import { useBeraJs } from "~/contexts";
import { DefaultHookOptions, DefaultHookReturnType } from "~/types";

export const usePollValidatorBlockStats = (
  address: Address,
  options?: DefaultHookOptions,
): DefaultHookReturnType<GetValidatorBlockStatsQuery | undefined> => {
  const { config: beraConfig } = useBeraJs();
  const config = options?.beraConfigOverride ?? beraConfig;
  const QUERY_KEY = ["useValidatorBlockStatsSubgraph", address];
  const swrResponse = useSWRImmutable<GetValidatorBlockStatsQuery | undefined>(
    QUERY_KEY,
    async () => {
      if (!address) {
        throw new Error(
          "usePollValidatorBlockStats needs a valid validator address",
        );
      }
      return await getValidatorBlockStats({
        config,
        address: address,
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
