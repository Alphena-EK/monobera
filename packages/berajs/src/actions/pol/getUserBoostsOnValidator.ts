import { bgtTokenAddress } from "@bera/config";
import { GetPublicClientReturnType } from "@wagmi/core";
import { Address, formatEther } from "viem";
import { BGT_ABI } from "~/abi";
import { type BeraConfig } from "~/types";

export type UserBoostsOnValidator = {
  activeBoosts: string;
  queuedBoosts: string;
  queueBoostStartBlock: number;
  queuedUnboosts: string;
  queueUnboostStartBlock: number;
};

export const getUserBoostsOnValidator = async ({
  config,
  account,
  pubkey,
  publicClient,
}: {
  config: BeraConfig;
  account: Address;
  pubkey: Address;
  publicClient: GetPublicClientReturnType;
}): Promise<UserBoostsOnValidator> => {
  if (!account) {
    throw new Error("account is required");
  }
  if (!publicClient) {
    throw new Error("publicClient is required");
  }

  const [activeBoosts, queuedBoosts, queuedUnboosts] = await Promise.all([
    publicClient.readContract({
      address: bgtTokenAddress,
      abi: BGT_ABI,
      functionName: "boosted",
      args: [account!, pubkey!],
    }),
    publicClient.readContract({
      address: bgtTokenAddress,
      abi: BGT_ABI,
      functionName: "boostedQueue",
      args: [account!, pubkey!],
    }),
    publicClient.readContract({
      address: bgtTokenAddress,
      abi: BGT_ABI,
      functionName: "dropBoostQueue",
      args: [account!, pubkey!],
    }),
  ]);

  return {
    activeBoosts: formatEther(activeBoosts),
    queuedBoosts: formatEther(queuedBoosts[1]),
    queuedUnboosts: formatEther(queuedUnboosts[1]),
    queueBoostStartBlock: queuedBoosts[0],
    queueUnboostStartBlock: queuedUnboosts[0],
  };
};
