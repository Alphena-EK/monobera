import { Address, PublicClient, formatUnits, parseUnits } from "viem";

import { honeyFactoryAbi, honeyFactoryReaderAbi } from "~/abi";
import { BeraConfig, Token } from "~/types";

export enum HoneyPreviewMethod {
  Mint = "previewMintHoney",
  RequiredCollateral = "previewMintCollaterals",
  Redeem = "previewRedeemCollaterals",
  HoneyToRedeem = "previewRedeemHoney",
}

export interface HoneyPreviewArgs {
  client: PublicClient;
  config: BeraConfig;
  collateral: Token;
  collateralList: Token[] | undefined;
  amount: string;
  method: HoneyPreviewMethod;
}

export interface HoneyPreviewResult {
  collaterals: Record<Address, bigint>;
  honey: bigint;
}

export interface HoneyPreviewReadResult {
  collaterals: bigint[];
  honey: bigint;
}

/**
 * fetch the mint and redeem rate of all colleteral tokens
 */
export const getHoneyPreview = async ({
  client,
  config,
  collateral,
  amount,
  method,
}: HoneyPreviewArgs): Promise<HoneyPreviewResult | undefined> => {
  try {
    if (!config.contracts?.honeyFactoryAddress)
      throw new Error("missing contract address honeyFactoryAddress");

    let formattedAmount = 0n;
    if (
      method === HoneyPreviewMethod.Mint ||
      method === HoneyPreviewMethod.HoneyToRedeem
    ) {
      formattedAmount = parseUnits(amount, collateral.decimals);
    } else {
      formattedAmount = parseUnits(amount, 18); //honey decimals
    }
    let formattedResult: HoneyPreviewReadResult;
    if (
      method === HoneyPreviewMethod.Mint ||
      method === HoneyPreviewMethod.HoneyToRedeem
    ) {
      const result = (await client.readContract({
        address: config.contracts.honeyFactoryReaderAddress as Address,
        abi: honeyFactoryReaderAbi,
        functionName: method,
        args: [collateral.address, formattedAmount],
      })) as [bigint[], bigint];

      formattedResult = {
        collaterals: result[0],
        honey: result[1],
      };
    } else {
      const result = (await client.readContract({
        address: config.contracts.honeyFactoryReaderAddress as Address,
        abi: honeyFactoryReaderAbi,
        functionName: method,
        args: [collateral.address, formattedAmount],
      })) as bigint[];

      formattedResult = {
        collaterals: result,
        honey: formattedAmount,
      };
    }

    const collaterals = await Promise.all(
      formattedResult.collaterals.map((collateral, idx) =>
        client.readContract({
          address: config.contracts!.honeyFactoryAddress!,
          abi: honeyFactoryAbi,
          functionName: "registeredAssets",
          args: [BigInt(idx)],
        }),
      ),
    );

    const amountsWithAddress: Record<Address, bigint> = collaterals.reduce(
      (agg, key, idx) =>
        Object.assign(agg, { [key]: formattedResult.collaterals[idx] }),
      {},
    );

    return {
      collaterals: amountsWithAddress,
      honey: formattedResult.honey,
    };
  } catch (e) {
    console.log("error", e);
    return undefined;
  }
};
