import { encodeFunctionData } from "viem";

import { balancerRelayerAbi } from "../../abi";
import { Address, Hex } from "../../types";
import { BALANCER_RELAYER, ZERO_ADDRESS } from "../../utils";

import { Relayer } from "../relayer";
import { TokenAmount } from "../tokenAmount";
import { NestedPoolState } from "../types";
import { validateNestedPoolState } from "../utils";

import { encodeCalls } from "./encodeCalls";
import { doRemoveLiquidityNestedQuery } from "./doRemoveLiquidityNestedQuery";
import { getPeekCalls } from "./getPeekCalls";
import { getQueryCallsAttributes } from "./getQueryCallsAttributes";
import {
  RemoveLiquidityNestedQueryOutput,
  RemoveLiquidityNestedCallInput,
  RemoveLiquidityNestedInput,
} from "./types";
import { validateQueryInput, validateBuildCallInput } from "./validateInputs";

export class RemoveLiquidityNested {
  async query(
    input: RemoveLiquidityNestedInput,
    nestedPoolState: NestedPoolState,
  ): Promise<RemoveLiquidityNestedQueryOutput> {
    const isProportional = validateQueryInput(input, nestedPoolState);
    validateNestedPoolState(nestedPoolState);

    const { callsAttributes, bptAmountIn } = getQueryCallsAttributes(
      input,
      nestedPoolState.pools,
      isProportional,
    );

    const encodedCalls = encodeCalls(callsAttributes, isProportional);

    const { peekCalls, tokensOut } = getPeekCalls(
      callsAttributes,
      isProportional,
    );

    // insert peek calls to get amountsOut
    let tokensOutCount = 0;
    const tokensOutIndexes: number[] = [];
    callsAttributes.forEach((call, i) => {
      tokensOut.forEach((tokenOut, j) => {
        if (call.sortedTokens.some((t) => t.isSameAddress(tokenOut.address))) {
          tokensOutCount++;
          encodedCalls.splice(i + tokensOutCount, 0, peekCalls[j]);
          tokensOutIndexes.push(i + tokensOutCount);
        }
      });
    });

    const encodedMulticall = encodeFunctionData({
      abi: balancerRelayerAbi,
      functionName: "vaultActionsQueryMulticall",
      args: [encodedCalls],
    });

    const peekedValues = await doRemoveLiquidityNestedQuery(
      input.chainId,
      input.rpcUrl,
      encodedMulticall,
      tokensOutIndexes,
    );

    const amountsOut = tokensOut.map((tokenOut, i) =>
      TokenAmount.fromRawAmount(tokenOut, peekedValues[i]),
    );

    return {
      callsAttributes,
      bptAmountIn,
      amountsOut,
      isProportional,
      chainId: input.chainId,
    };
  }

  buildCall(input: RemoveLiquidityNestedCallInput): {
    callData: Hex;
    to: Address;
    minAmountsOut: TokenAmount[];
  } {
    validateBuildCallInput(input);

    // apply slippage to amountsOut
    const minAmountsOut = input.amountsOut.map((amountOut) =>
      TokenAmount.fromRawAmount(
        amountOut.token,
        input.slippage.applyTo(amountOut.amount, -1),
      ),
    );

    input.callsAttributes.forEach((call) => {
      // update relevant calls with minAmountOut limits in place
      minAmountsOut.forEach((minAmountOut, j) => {
        const minAmountOutIndex = call.sortedTokens.findIndex((t) =>
          t.isSameAddress(minAmountOut.token.address),
        );
        if (minAmountOutIndex !== -1) {
          call.minAmountsOut[minAmountOutIndex] = minAmountsOut[j].amount;
        }
      });
      // update wethIsEth flag
      call.wethIsEth = !!input.wethIsEth;
      // update sender and recipient placeholders
      call.sender =
        call.sender === ZERO_ADDRESS ? input.accountAddress : call.sender;
      call.recipient =
        call.recipient === ZERO_ADDRESS ? input.accountAddress : call.recipient;
    });

    const encodedCalls = encodeCalls(
      input.callsAttributes,
      input.isProportional,
    );

    // prepend relayer approval if provided
    if (input.relayerApprovalSignature !== undefined) {
      encodedCalls.unshift(
        Relayer.encodeSetRelayerApproval(
          BALANCER_RELAYER[input.callsAttributes[0].chainId],
          true,
          input.relayerApprovalSignature,
        ),
      );
    }

    const callData = encodeFunctionData({
      abi: balancerRelayerAbi,
      functionName: "multicall",
      args: [encodedCalls],
    });

    return {
      callData,
      to: BALANCER_RELAYER[input.callsAttributes[0].chainId],
      minAmountsOut,
    };
  }
}
