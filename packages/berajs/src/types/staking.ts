import { ValidatorStakedBgtsFragment } from "@bera/graphql/pol/subgraph";
import { Address } from "viem";

import type { Token } from "./dex";
import { ApiValidatorFragment } from "@bera/graphql/pol/api";

export interface ValidatorInfo {
  id: Address;
  name: string;
  Description: string;
  website: string;
  logoURI: string;
  twitter?: string;
}

export type Validator = ApiValidatorFragment;

export type UserValidator = Validator & {
  amountDeposited: string;
  amountQueued: string;
  latestBlock: string;
  latestBlockTime: string;
  canActivate?: boolean;
};

export type CuttingBoardWeight = {
  amount?: number;
  owner: Address;
  percentageNumerator: string;
  receiver: Address;
  receiverMetadata?: Vault;
};
interface ProductMetadata {
  name: string;
  logoURI: string;
  url: string;
  description: string;
}

export type Vault = {
  logoURI: string;
  name: string;
  product: string;
  receiptTokenAddress: Address;
  url: string;
  vaultAddress: Address;
  productMetadata?: ProductMetadata;
};

export type RewardVaultIncentive = {
  amountRemaining: number;
  id: Address;
  incentiveRate: number;
  manager: Address;
  token: Token;
  vaultId?: Address;
};

export type Market = {
  name: string;
  logoURI: string;
  url: string;
  description: string;
};

export type ValidatorList = {
  id: string;
  logoURI: string;
  name: string;
  website: string;
  description: string;
  twitter: string;
};

export interface ValidatorResponse {
  userValidators: UserValidatorPair[];
}

interface UserValidatorPair {
  userValidator: UserValidator;
  validator: Validator;
}

export type UserValidatorBoostQueued = {
  amountQueued: string;
  user: Address;
};

export type UserValidatorBoostDeposited = {
  amountDeposited: string;
  user: Address;
};

/**
 * @deprecated use ValidatorStakedBgtsFragment instead from @bera/graphql/pol
 */
export type ValidatorBgtStaked = ValidatorStakedBgtsFragment;

export type ValidatorBgtStakedDelta = {
  amountStaked: string;
  coinbase: string;
  timestamp: string;
};

export type ValidatorUsages = {
  allTimeUsdValueTokenRewarded: string;
};

export type ValidatorUsage = {
  bgtDirected: string;
  timestamp: string;
  allTimeBGTDistributed: string;
  allTimeUsdValueBgtDirected: string;
  validator: {
    commission: string;
  };
};

export type AllTimeBlockCount = {
  allTimeBlockCount: string;
};

export type ValidatorIncentivesReceiveds = {
  token: Token;
  tokenReceived: string;
  usdValueTokenRewarded: string;
  timestamp: string;
  allTimeUsdValueTokenRewarded: string;
  id: string;
};
