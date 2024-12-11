import useSWR from "swr";
import { Address } from "viem";
import { usePublicClient } from "wagmi";
import { UserBoostsOnValidator, getUserBoostsOnValidator } from "~/actions";
import { useBeraJs } from "~/contexts";
import { DefaultHookReturnType } from "~/types";

export const useUserBoostsOnValidator = ({
  pubkey,
  ...args
}: {
  pubkey: Address;
  account?: Address;
}): DefaultHookReturnType<UserBoostsOnValidator> => {
  const { account: connectedAccount, config: beraConfig } = useBeraJs();

  const publicClient = usePublicClient();
  const account = args.account ?? connectedAccount;

  const QUERY_KEY =
    account && pubkey ? ["useUserBoostsOnValidator", pubkey, account] : null;

  const swrResponse = useSWR(QUERY_KEY, async () => {
    if (!account) {
      throw new Error("useUserBoostsOnValidator needs a logged in account");
    }
    return await getUserBoostsOnValidator({
      config: beraConfig,
      account,
      pubkey,
      publicClient,
    });
  });

  return { ...swrResponse, refresh: () => swrResponse.mutate() };
};
