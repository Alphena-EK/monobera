import { useEffect, useState } from "react";
import { PoolType } from "@berachain-foundation/berancer-sdk";

import { SubgraphTokenInformations } from "~/actions";
import { TokenWithAmount } from "~/types";

const DEFAULT_LIQUIDITY_MISMATCH_TOLERANCE_PERCENT = 0.05; // 5%

export type LiquidityMismatchInfo = {
  title: string | null;
  message: string | null;
};

interface UseLiquidityMismatchParams {
  tokenPrices?: SubgraphTokenInformations;
  tokens: TokenWithAmount[] | null;
  weights: bigint[] | null;
  weightsError: string | null;
  poolType: PoolType;
  liquidityMismatchTolerancePercent?: number;
}

/**
 * A hook that checks for liquidity mismatches in a pool. It evaluates whether the USD value of tokens
 * added aligns with the pool's specified weights or type (e.g., Stable, Weighted). If a mismatch is
 * detected, it provides a title and message to warn the user.
 *
 * @param {SubgraphTokenInformations} tokenPrices - Pricing information for tokens, including USD values.
 * @param {TokenWithAmount[]} tokens - Array of tokens with addresses & amounts.
 * @param {bigint[]} weights - Array of weights for each token, used for proportional calculations.
 * @param {string | null} weightsError - Message inidicating there's an error with token weights (don't fire hook if true).
 * @param {PoolType} poolType - The type of pool being created (Stable, Weighted, etc.).
 * @returns {LiquidityMismatchInfo} An object containing a title and message if a mismatch is detected.
 */
export const useLiquidityMismatch = ({
  tokenPrices,
  tokens,
  weights,
  weightsError,
  poolType,
  liquidityMismatchTolerancePercent = DEFAULT_LIQUIDITY_MISMATCH_TOLERANCE_PERCENT,
}: UseLiquidityMismatchParams): LiquidityMismatchInfo => {
  const [liquidityMismatchInfo, setLiquidityMismatchInfo] = useState<{
    title: string | null;
    message: string | null;
  }>({ title: null, message: null });

  useEffect(() => {
    if (!tokenPrices || !tokens || !weights || weightsError) {
      setLiquidityMismatchInfo({ title: null, message: null });
      return;
    }

    let totalLiquidityUSD = 0;
    const tokenUSDValues: number[] = [];
    let totalMismatchedLiquidityUSD = 0;

    tokens.forEach((token) => {
      const tokenPriceUSD = tokenPrices[token.address];
      const tokenAmount = parseFloat(token.amount);
      if (!tokenPriceUSD || tokenAmount <= 0) return;
      const tokenLiquidityUSD = Number(tokenPriceUSD) * tokenAmount;
      tokenUSDValues.push(tokenLiquidityUSD);
      totalLiquidityUSD += tokenLiquidityUSD;
    });

    if (totalLiquidityUSD === 0) {
      setLiquidityMismatchInfo({ title: null, message: null });
      return;
    }

    let liquidityMismatch = false;

    if (
      poolType === PoolType.Stable ||
      poolType === PoolType.ComposableStable
    ) {
      const averageLiquidityUSD = totalLiquidityUSD / tokenUSDValues.length;

      tokenUSDValues.forEach((value) => {
        const absoluteDifference = Math.abs(value - averageLiquidityUSD);
        const percentageDifference = absoluteDifference / averageLiquidityUSD;

        if (percentageDifference > liquidityMismatchTolerancePercent) {
          liquidityMismatch = true;
          totalMismatchedLiquidityUSD += absoluteDifference;
        }
      });
    } else if (poolType === PoolType.Weighted) {
      tokenUSDValues.forEach((value, index) => {
        const weightProportion = Number(weights[index]) / Number(BigInt(1e18));
        const expectedWeightUSD = totalLiquidityUSD * weightProportion;

        const absoluteDifference = Math.abs(value - expectedWeightUSD);
        const percentageDifference = absoluteDifference / expectedWeightUSD;

        if (percentageDifference > liquidityMismatchTolerancePercent) {
          liquidityMismatch = true;
          totalMismatchedLiquidityUSD += absoluteDifference;
        }
      });
    }

    // Check if the total mismatched liquidity exceeds the tolerance
    const totalMismatchPercentage =
      totalMismatchedLiquidityUSD / totalLiquidityUSD;

    if (
      !liquidityMismatch ||
      totalMismatchPercentage <= liquidityMismatchTolerancePercent
    ) {
      setLiquidityMismatchInfo({ title: null, message: null });
      return;
    }

    setLiquidityMismatchInfo({
      title: `You could lose up to $${totalMismatchedLiquidityUSD.toFixed(
        2,
      )} (${(totalMismatchPercentage * 100).toFixed(2)}%)`,
      message: `Based on current token USD pricing in terms of HONEY, the value of tokens added does not align with the 
        specified pool weights. This creates vulnerability to arbitrageurs.`,
    });
  }, [
    tokenPrices,
    tokens,
    weights,
    weightsError,
    poolType,
    liquidityMismatchTolerancePercent,
  ]);

  return liquidityMismatchInfo;
};
