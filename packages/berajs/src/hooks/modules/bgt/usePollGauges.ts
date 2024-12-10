import useSWR from "swr";

import { getGauges } from "~/actions/bgt/getGauges";
import { DefaultHookOptions, useBeraJs } from "../../..";
import { GetVaultsQueryVariables } from "@bera/graphql/pol/api";

export const usePollGauges = (
  filter?: GetVaultsQueryVariables,
  options?: DefaultHookOptions,
) => {
  const { config: beraConfig, account } = useBeraJs();
  const config = options?.beraConfigOverride ?? beraConfig;
  const QUERY_KEY = ["defaultGaugeList", config, account, filter];
  const swrResponse = useSWR(
    QUERY_KEY,
    async () => {
      return await getGauges(config, filter);
    },
    {
      ...options?.opts,
    },
  );

  return {
    ...swrResponse,
    refresh: swrResponse.mutate,
  };
};
