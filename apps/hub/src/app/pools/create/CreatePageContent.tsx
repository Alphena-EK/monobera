"use client";

import {
  bexAbi,
  encodeCrocPrice,
  getSafeNumber,
  POOLID,
  Token,
  TransactionActionType,
} from "@bera/berajs";
import {
  ActionButton,
  ApproveButton,
  SSRSpinner,
  useAnalytics,
  useSlippage,
  useTxn,
} from "@bera/shared-ui";
import { cn } from "@bera/ui";
import { Alert, AlertDescription, AlertTitle } from "@bera/ui/alert";
import { Button } from "@bera/ui/button";
import { Card } from "@bera/ui/card";
import { Icons } from "@bera/ui/icons";
import { Input } from "@bera/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@bera/ui/tabs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import {
  parseUnits,
  formatUnits,
  encodeAbiParameters,
  parseAbiParameters,
} from "viem";
import CreatePoolInitialLiquidityInput from "~/components/create-pool/create-pool-initial-liquidity-input";
import CreatePoolInput from "~/components/create-pool/create-pool-input";
import useCreateTokenWeights from "~/hooks/useCreateTokenWeights";
import { getBaseCost, getQuoteCost } from "../fetchPools";
import useCreatePool from "~/hooks/useCreatePool";

import { crocDexAddress } from "@bera/config";
import { useCrocIsDupePool } from "~/hooks/useCrocIsDupePool";

const INITIAL_AMOUNT = 11000n;

function calculateBaseTokenAmount(initLiq: bigint, priceArg: bigint) {
  // Convert inputs to BigInt to ensure precision in calculations
  const initLiqBigInt = initLiq;
  const priceArgBigInt = priceArg;

  // Calculate the amount for base side tokens
  // [initLiq * priceArg] >> 64
  const baseTokenAmount = (initLiqBigInt * priceArgBigInt) >> BigInt(64);
  const increasedBaseTokenAmount =
    (baseTokenAmount * BigInt(120)) / BigInt(100);
  return increasedBaseTokenAmount;
}

function calculateQuoteTokenAmount(initLiq: bigint, priceArg: bigint) {
  // Convert inputs to BigInt to ensure precision in calculations
  const initLiqBigInt = initLiq;
  const priceArgBigInt = priceArg;

  // Calculate the amount for quote side tokens
  // [initLiq << 64] / priceArg
  const quoteTokenAmount = (initLiqBigInt << BigInt(64)) / priceArgBigInt;

  const increasedQuoteTokenAmount =
    (quoteTokenAmount * BigInt(120)) / BigInt(100);
  return increasedQuoteTokenAmount;
}

export default function CreatePageContent() {
  const {
    error,
    poolId,
    initialPrice,
    isBaseTokenInput,
    tokenA,
    tokenB,
    baseToken,
    quoteToken,
    baseAmount,
    quoteAmount,
    isPriceBase,
    quoteBasedInitialPrice,
    setIsPriceBase,
    setBaseAmount,
    setQuoteAmount,
    setTokenA,
    setTokenB,
    setIsBaseTokenInput,
    setInitialPrice,
    setPoolId,
  } = useCreateTokenWeights();

  const router = useRouter();
  useEffect(() => {
    setBaseAmount("");
    setQuoteAmount("");
  }, [initialPrice, isPriceBase]);

  useEffect(() => {
    setBaseAmount("");
    setQuoteAmount("");
    setInitialPrice("");
  }, [poolId]);

  const baseCost = useMemo(() => {
    if (poolId === POOLID.STABLE) {
      return getBaseCost(1);
    }
    return getBaseCost(getSafeNumber(initialPrice));
  }, [initialPrice]);
  const quoteCost = useMemo(() => {
    if (poolId === POOLID.STABLE) {
      return getQuoteCost(1);
    }
    return getQuoteCost(getSafeNumber(initialPrice));
  }, [initialPrice]);

  const handleBaseAssetAmountChange = (value: string): void => {
    if (poolId === POOLID.STABLE) {
      setBaseAmount(value);
      setQuoteAmount(value);
      return;
    }

    if (isPriceBase) {
      setBaseAmount(value);
      const parsedBaseCost = parseUnits(
        baseCost.toString(),
        quoteToken?.decimals ?? 18,
      );
      const parsedValue = parseUnits(value, quoteToken?.decimals ?? 18);
      setIsBaseTokenInput(true);
      const quoteAmount =
        (parsedBaseCost * parsedValue) /
        BigInt(10 ** (quoteToken?.decimals ?? 18));

      setQuoteAmount(
        quoteAmount === 0n
          ? ""
          : formatUnits(quoteAmount, quoteToken?.decimals ?? 18),
      );
    } else {
      setBaseAmount(value);
      const parsedBaseCost = parseUnits(
        quoteCost.toString(),
        quoteToken?.decimals ?? 18,
      );
      const parsedValue = parseUnits(value, quoteToken?.decimals ?? 18);
      setIsBaseTokenInput(true);
      const quoteAmount =
        (parsedBaseCost * parsedValue) /
        BigInt(10 ** (quoteToken?.decimals ?? 18));

      setQuoteAmount(
        quoteAmount === 0n
          ? ""
          : formatUnits(quoteAmount, quoteToken?.decimals ?? 18),
      );
    }
  };

  const handleQuoteAssetAmountChange = (value: string): void => {
    if (poolId === POOLID.STABLE) {
      setBaseAmount(value);
      setQuoteAmount(value);
      return;
    }

    if (isPriceBase) {
      setQuoteAmount(value);
      setIsBaseTokenInput(false);
      const parsedQuoteCost = parseUnits(
        quoteCost.toString(),
        baseToken?.decimals ?? 18,
      );
      const parsedValue = parseUnits(value, baseToken?.decimals ?? 18);
      const baseAmount =
        (parsedQuoteCost * parsedValue) /
        BigInt(10 ** (baseToken?.decimals ?? 18));

      setBaseAmount(
        baseAmount === 0n
          ? ""
          : formatUnits(baseAmount, baseToken?.decimals ?? 18),
      );
    } else {
      setQuoteAmount(value);
      setIsBaseTokenInput(false);
      const parsedQuoteCost = parseUnits(
        baseCost.toString(),
        baseToken?.decimals ?? 18,
      );
      const parsedValue = parseUnits(value, baseToken?.decimals ?? 18);
      const baseAmount =
        (parsedQuoteCost * parsedValue) /
        BigInt(10 ** (baseToken?.decimals ?? 18));

      setBaseAmount(
        baseAmount === 0n
          ? ""
          : formatUnits(baseAmount, baseToken?.decimals ?? 18),
      );
    }
  };

  const { captureException, track } = useAnalytics();

  const { write, ModalPortal } = useTxn({
    message: "Create new pool",
    onSuccess: () => {
      track("create_pool_success");
      router.push("/pools");
    },
    onError: (e: Error | undefined) => {
      track("create_pool_failed");
      captureException(new Error("create pool failed"), {
        data: { rawError: e },
      });
    },
    actionType: TransactionActionType.CREATE_POOL,
  });

  const slippage = useSlippage();

  const handleCreatePool = useCallback(async () => {
    return;
  }, [
    baseToken,
    quoteToken,
    quoteBasedInitialPrice,
    isBaseTokenInput,
    slippage,
    write,
  ]);

  const { needsApproval, refreshAllowances } = useCreatePool({
    baseToken: baseToken as Token,
    quoteToken: quoteToken as Token,
    baseAmount,
    quoteAmount,
  });

  const { useIsDupePool, isLoading: isDupePoolLoading } = useCrocIsDupePool({
    tokenA,
    tokenB,
    poolIdx: poolId as any,
  });
  const isDupePool = useIsDupePool();
  const setPriceSectionDisabled =
    !tokenA || !tokenB || isDupePool || isDupePool === undefined;

  const setInitialLiquiditySectionDisabled =
    (poolId === POOLID.AMBIENT && (setPriceSectionDisabled || !initialPrice)) ||
    (poolId === POOLID.STABLE && (!tokenA || !tokenB)) ||
    isDupePool ||
    isDupePool === undefined;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8 max-w-[600px]">
      {ModalPortal}
      <Button
        variant={"ghost"}
        size="sm"
        className="flex items-center gap-1 self-start"
        onClick={() => router.push("/pools")}
      >
        <Icons.arrowLeft className="h-4 w-4" />
        <div className="text-sm font-medium">All Pools</div>
      </Button>
      <div className="flex w-full flex-col items-center justify-center gap-16">
        <section className="w-full flex flex-col gap-4">
          <h1 className="text-3xl font-semibold self-start">Creating a pool</h1>
          <div className="w-full flex flex-row gap-6">
            <CreatePoolInput
              key={0}
              token={tokenA}
              selectedTokens={[tokenA, tokenB] as Token[]}
              onTokenSelection={setTokenA}
            />
            <CreatePoolInput
              key={1}
              token={tokenB}
              selectedTokens={[tokenA, tokenB] as Token[]}
              onTokenSelection={setTokenB}
            />
          </div>
        </section>

        <section className="w-full flex flex-col gap-4">
          <h1 className="text-3xl font-semibold self-start">
            Select a pair type
          </h1>

          <div className="w-full flex flex-row gap-6">
            <Card
              onClick={() => setPoolId(POOLID.AMBIENT)}
              className={cn(
                "p-4 flex flex-col gap-0 w-full border-2",
                poolId === POOLID.AMBIENT && "border-sky-600",
              )}
            >
              <span className="text-lg font-semibold">Ambient</span>
              <span className="text-sm text-muted-foreground mt-[-4px]">
                Recommended for volatile pairs
              </span>
              <span className="text-sm text-muted-foreground mt-[24px]">
                Fee: <span className="text-foreground font-medium">0.3%</span>
              </span>
            </Card>
            <Card
              // onClick={() => setPoolId(POOLID.STABLE)}
              className={cn(
                "p-4 flex flex-col gap-0 w-full border-2 opacity-50 cursor-not-allowed",
                poolId === POOLID.STABLE && "border-sky-600",
              )}
            >
              <span className="text-lg font-semibold">
                Stable (coming soon)
              </span>
              <span className="text-sm text-muted-foreground mt-[-4px]">
                Recommended for stable pairs
              </span>
              <span className="text-sm text-muted-foreground mt-[24px]">
                Fee: <span className="text-foreground font-medium">0.01%</span>
              </span>
            </Card>
          </div>
        </section>

        {isDupePool && (
          <Alert variant="destructive">
            <AlertTitle>Similar Pools Already Exist</AlertTitle>
            <AlertDescription>
              Please note that creating this pool will not be possible; consider
              adding liquidity to an existing pool instead.
            </AlertDescription>
          </Alert>
        )}

        {isDupePoolLoading && tokenA && tokenB && (
          <div className="flex flex-row items-center text-2xl font-medium gap-2 justify-start w-full">
            <SSRSpinner size={10} /> Checking for duplicate pools.
          </div>
        )}

        {poolId === POOLID.AMBIENT && (
          <section
            className={cn(
              "w-full flex flex-col gap-4",
              setPriceSectionDisabled && "opacity-25 pointer-events-none",
            )}
          >
            <h1 className="text-3xl font-semibold self-start ">Set Price</h1>
            {!setPriceSectionDisabled && (
              <div>
                <span className="text-sm text-muted-foreground">
                  Denominate in
                </span>
                <Tabs defaultValue="base">
                  <TabsList
                    className="grid w-fit grid-cols-2 bg-none"
                    variant="ghost"
                  >
                    <TabsTrigger
                      value="base"
                      onClick={() => setIsPriceBase(true)}
                    >
                      {baseToken?.symbol}
                    </TabsTrigger>
                    <TabsTrigger
                      value="quote"
                      onClick={() => setIsPriceBase(false)}
                    >
                      {quoteToken?.symbol}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}
            <div className="rounded-sm border-border border p-2">
              <Input
                value={initialPrice}
                onChange={(e) => setInitialPrice(e.target.value)}
                type="number-enhanced"
                className="border-none bg-transparent text-3xl font-semibold p-0"
              />
              {!setPriceSectionDisabled && (
                <span className="text-sm text-muted-foreground font-medium">
                  {isPriceBase
                    ? `${baseToken?.symbol} per ${quoteToken?.symbol}`
                    : `${quoteToken?.symbol} per ${baseToken?.symbol}`}
                </span>
              )}
            </div>
          </section>
        )}
        <section
          className={cn(
            "w-full flex flex-col gap-4",
            setInitialLiquiditySectionDisabled &&
              "opacity-25 pointer-events-none",
          )}
        >
          <h1 className="text-3xl font-semibold self-start">
            Initial Liquidity
          </h1>
          <div className="flex flex-col gap-4">
            <ul className="divide divide-y divide-border rounded-lg border">
              <CreatePoolInitialLiquidityInput
                disabled={false}
                key={0}
                token={baseToken as Token}
                tokenAmount={baseAmount}
                onTokenBalanceChange={handleBaseAssetAmountChange}
              />
              <CreatePoolInitialLiquidityInput
                disabled={false}
                key={1}
                token={quoteToken as Token}
                tokenAmount={quoteAmount}
                onTokenBalanceChange={handleQuoteAssetAmountChange}
              />
            </ul>
          </div>
          {error && !setInitialLiquiditySectionDisabled && (
            <Alert variant="destructive" className="my-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error?.message}</AlertDescription>
            </Alert>
          )}

          {needsApproval.length > 0 &&
          baseAmount !== "" &&
          baseAmount !== "0" &&
          quoteAmount !== "" &&
          quoteAmount !== "0" ? (
            <ActionButton>
              <ApproveButton
                amount={parseUnits(
                  baseToken?.address === needsApproval[0]?.address
                    ? baseAmount
                    : quoteAmount,
                  needsApproval[0]?.decimals ?? 18,
                )}
                token={needsApproval[0]}
                spender={crocDexAddress}
                onApproval={() => refreshAllowances()}
              />
            </ActionButton>
          ) : (
            <ActionButton>
              <Button
                disabled={
                  baseAmount === "" ||
                  baseAmount === "0" ||
                  quoteAmount === "" ||
                  quoteAmount === "0"
                }
                className="w-full"
                onClick={() => handleCreatePool()}
              >
                Create Pool
              </Button>
            </ActionButton>
          )}
        </section>
      </div>
    </div>
  );
}
