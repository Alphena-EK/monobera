import useSWR from "swr";

import {
  ValidatorWithUserBoost,
  getUserActiveValidators,
} from "~/actions/pol/get-user-active-validators";
import { useBeraJs } from "~/contexts";
import POLLING from "~/enum/polling";
import { DefaultHookOptions, DefaultHookReturnType } from "~/types/global";

export interface UseUserActiveValidatorsResponse
  extends DefaultHookReturnType<ValidatorWithUserBoost[] | undefined> {}

export const useUserActiveValidators = (
  options?: DefaultHookOptions,
): UseUserActiveValidatorsResponse => {
  const { account, config: beraConfig } = useBeraJs();
  const config = options?.beraConfigOverride ?? beraConfig;
  const QUERY_KEY = account ? ["useUserActiveValidators", account] : null;

  const swrResponse = useSWR<ValidatorWithUserBoost[] | undefined>(
    QUERY_KEY,
    async () => {
      if (!account) {
        throw new Error("useUserActiveValidators needs a logged in account");
      }
      return await getUserActiveValidators({ config, account: account });
    },
    {
      ...options,
      refreshInterval: options?.opts?.refreshInterval ?? POLLING.SLOW,
      keepPreviousData: true,
    },
  );

  return {
    ...swrResponse,
    refresh: () => swrResponse?.mutate?.(),
  };
};
