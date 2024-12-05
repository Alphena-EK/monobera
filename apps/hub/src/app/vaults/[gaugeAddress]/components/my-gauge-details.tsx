import {
  BERA_VAULT_REWARDS_ABI,
  Gauge,
  TransactionActionType,
  useBeraJs,
  usePollVaultsInfo,
  useTokenHoneyPrice,
  type RewardVault,
} from "@bera/berajs";
import { beraTokenAddress } from "@bera/config";
import { FormattedNumber, useAnalytics, useTxn } from "@bera/shared-ui";
import { Button } from "@bera/ui/button";
import { Icons } from "@bera/ui/icons";
import BigNumber from "bignumber.js";

import { GaugueLPChange } from "./gauge-lp-change";

export const MyGaugeDetails = ({
  gauge,
  rewardVault,
}: {
  gauge: Gauge | undefined | null;
  rewardVault: RewardVault;
}) => {
  const { isReady, account } = useBeraJs();
  const { data, refresh } = usePollVaultsInfo({
    vaultAddress: rewardVault.address,
  });
  const { data: price } = useTokenHoneyPrice({
    tokenAddress: beraTokenAddress,
  });
  const { captureException, track } = useAnalytics();
  const { write, ModalPortal } = useTxn({
    message: "Claim BGT Rewards",
    actionType: TransactionActionType.CLAIMING_REWARDS,
    onSuccess: () => {
      refresh();
    },
  });
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <GaugueLPChange rewardVault={rewardVault} />
      {isReady && data && (
        <div className="flex w-full flex-col gap-4 lg:max-w-[440px]">
          <div className="flex flex-col gap-8 rounded-md border border-border p-4">
            <div className="text-lg font-semibold leading-7">
              My Reward Vault Deposits
            </div>
            <div className="flex justify-between font-medium leading-6">
              <div>{gauge?.metadata?.name}</div>
              <div className="flex flex-row items-center gap-2">
                <FormattedNumber
                  value={data?.balance ?? 0}
                  showIsSmallerThanMin
                />
                <FormattedNumber
                  value={data?.percentage ?? 0}
                  percent
                  showIsSmallerThanMin
                  className="text-sm text-muted-foreground"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-8 rounded-md border border-border p-4">
            <div className="text-lg font-semibold leading-7">
              Unclaimed Rewards
            </div>
            <div className="flex justify-between font-medium leading-6">
              <div className="flex items-center gap-2">
                <Icons.bgt className="h-6 w-6" />
                BGT
              </div>
              <div className="flex flex-row items-center gap-2">
                <FormattedNumber
                  value={data?.rewards ?? 0}
                  showIsSmallerThanMin
                />
                <FormattedNumber
                  value={BigNumber(data?.rewards ?? "0").times(price ?? 0)}
                  symbol="USD"
                  showIsSmallerThanMin
                  className="text-sm text-muted-foreground"
                />
              </div>
            </div>
            <Button
              disabled={!data.rewards || Number(data.rewards) <= 0}
              onClick={() =>
                write({
                  address: rewardVault.address,
                  abi: BERA_VAULT_REWARDS_ABI,
                  functionName: "getReward",
                  params: [account!, account!], // TODO: A second param is needed here for recipient. Added current account twice for now
                })
              }
            >
              {" "}
              Claim Rewards
            </Button>
          </div>
        </div>
      )}
      {ModalPortal}
    </div>
  );
};
