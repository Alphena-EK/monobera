import useSWR from "swr";
import { usePublicClient } from "wagmi";

import { GlobalInfo, getBGTGlobalInfo } from "~/actions/bgt/getBGTGlobalInfo";
import { getBgtTokenTotalSupply } from "~/actions/bgt/getBgtTokenTotalSupply";
import { getGlobalCuttingBoard } from "~/actions/bgt/getGlobalCuttingBoard";
import { DefaultHookOptions, DefaultHookReturnType, useBeraJs } from "../../..";
import { ApiRewardAllocationWeightFragment } from "@bera/graphql/pol/api";

interface GlobalData extends GlobalInfo {
  globalCuttingBoard: ApiRewardAllocationWeightFragment[];
  bgtTotalSupply: string | undefined;
}
export interface IUsePollGlobalDataResponse
  extends DefaultHookReturnType<GlobalData> {}

export const usePollGlobalData = (
  options?: DefaultHookOptions,
): IUsePollGlobalDataResponse => {
  const publicClient = usePublicClient();
  const { config: beraConfig } = useBeraJs();
  const config = options?.beraConfigOverride ?? beraConfig;
  const QUERY_KEY = "usePollGlobalData";
  const swrResponse = useSWR<GlobalData, any, typeof QUERY_KEY>(
    QUERY_KEY,
    async () => {
      const [globalData, globalCuttingBoard, bgtTotalSupply] =
        await Promise.all([
          getBGTGlobalInfo(config),
          getGlobalCuttingBoard(300, config),
          getBgtTokenTotalSupply({
            publicClient,
          }),
        ]);
      return {
        bgtTotalSupply,
        globalCuttingBoard,
        ...globalData,
      } as any;
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
