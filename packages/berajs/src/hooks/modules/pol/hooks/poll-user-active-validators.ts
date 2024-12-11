import useSWR from "swr";

import { getUserActiveValidators } from "~/actions/pol/get-user-active-validators";
import { useBeraJs } from "~/contexts";
import POLLING from "~/enum/polling";
import { UserValidator } from "~/types";
import { DefaultHookOptions, DefaultHookReturnType } from "~/types/global";

export interface UseUserActiveValidatorsResponse
  extends DefaultHookReturnType<UserValidator[] | undefined> {
  getSelectedUserValidator: (
    validatorAddress: string,
  ) => UserValidator | undefined;
}

export const useUserActiveValidators = (
  options?: DefaultHookOptions,
): UseUserActiveValidatorsResponse => {
  const { account, config: beraConfig } = useBeraJs();
  const config = options?.beraConfigOverride ?? beraConfig;
  const QUERY_KEY = account ? ["useUserActiveValidators", account] : null;

  const swrResponse = useSWR<UserValidator[] | undefined>(
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
  const getSelectedUserValidator = (validatorAddress: string) => {
    const valiList = swrResponse.data;
    return valiList?.find(
      (validator: UserValidator) =>
        validator.pubkey.toLowerCase() === validatorAddress.toLowerCase(),
    );
  };
  return {
    ...swrResponse,
    getSelectedUserValidator,
    refresh: () => swrResponse?.mutate?.(),
  };
};
