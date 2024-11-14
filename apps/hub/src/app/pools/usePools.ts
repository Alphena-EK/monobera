import { useMemo, useState } from "react";
import { useBeraJs, useBgtInflation, type PoolV2 } from "@bera/berajs";
import { bexApiGraphqlClient } from "@bera/graphql";
import {
  GetPools,
  GetPoolsQuery,
  GetPoolsQueryVariables,
  MinimalPoolInListFragment,
} from "@bera/graphql/dex/api";
import { POLLING } from "@bera/shared-ui";
import useSWR from "swr";

export const usePools = ({ keyword }: { keyword: string }) => {
  const { account } = useBeraJs();
  const {
    data: pools,
    isLoading: isPoolsLoading,
    mutate: mutatePools,
  } = useSWR(
    ["useAllPools", keyword],
    async () => {
      const pools = await bexApiGraphqlClient.query<GetPoolsQuery>({
        query: GetPools,
        variables: {
          textSearch: keyword,
        },
      });

      return pools.data?.poolGetPools ?? [];
    },
    {
      refreshInterval: POLLING.SLOW,
    },
  );

  const {
    data: walletPools,
    isLoading: isWalletPoolsLoading,
    mutate: mutateWalletPools,
  } = useSWR(
    account ? ["useWalletPools", account, keyword] : null,
    async () => {
      const pools = await bexApiGraphqlClient.query<
        GetPoolsQuery,
        GetPoolsQueryVariables
      >({
        query: GetPools,
        variables: {
          textSearch: keyword,
          userAddress: account,
        },
      });
      return pools.data?.poolGetPools ?? [];
    },
    {
      refreshInterval: POLLING.SLOW,
    },
  );

  const mergedPools = useMemo(() => {
    if (!pools) return pools;
    if (!walletPools) return pools;

    return pools.map((pool) => {
      const walletPool = walletPools.find((p) => p.id === pool.id);
      return { ...pool, ...walletPool };
    });
  }, [account, pools, walletPools]);

  console.log({ mergedPools });

  return {
    pools: mergedPools,
    walletPools,
    isPoolsLoading,
    isWalletPoolsLoading,
    refresh: () => {
      mutatePools();
      mutateWalletPools();
    },
  };
};
