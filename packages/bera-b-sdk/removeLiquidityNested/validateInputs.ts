import { NATIVE_ASSETS } from "../../utils";
import { Token } from "../token";
import { NestedPoolState } from "../types";
import {
  RemoveLiquidityNestedCallInput,
  RemoveLiquidityNestedProportionalInput,
  RemoveLiquidityNestedSingleTokenInput,
} from "./types";

export const validateQueryInput = (
  input:
    | RemoveLiquidityNestedProportionalInput
    | RemoveLiquidityNestedSingleTokenInput,
  nestedPoolState: NestedPoolState,
) => {
  const tokenOut = "tokenOut" in input ? input.tokenOut : undefined;
  const isProportional = tokenOut === undefined;
  const mainTokens = nestedPoolState.mainTokens.map(
    (token) => new Token(input.chainId, token.address, token.decimals),
  );
  if (!isProportional) {
    validateInputsSingleToken(
      input as RemoveLiquidityNestedSingleTokenInput,
      mainTokens,
    );
  }

  return isProportional;
};

const validateInputsSingleToken = (
  input: RemoveLiquidityNestedSingleTokenInput,
  mainTokens: Token[],
) => {
  const tokenOut = mainTokens.find((t) => t.isSameAddress(input.tokenOut));

  if (tokenOut === undefined) {
    throw new Error(
      `Removing liquidity to ${input.tokenOut} requires it to exist within main tokens`,
    );
  }
};

export const validateBuildCallInput = (
  input: RemoveLiquidityNestedCallInput,
) => {
  if (
    input.wethIsEth &&
    !input.amountsOut.some((a) =>
      a.token.isSameAddress(NATIVE_ASSETS[input.chainId].wrapped),
    )
  ) {
    throw new Error(
      "Removing liquidity to native asset requires wrapped native asset to exist within amounts out",
    );
  }
};
