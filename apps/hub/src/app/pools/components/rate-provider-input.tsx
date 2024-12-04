import { useState } from "react";
import { RateProvider, getSafeNumber } from "@bera/berajs";
import { cn } from "@bera/ui";
import { Alert, AlertDescription, AlertTitle } from "@bera/ui/alert";
import { InputWithLabel } from "@bera/ui/input";

type Props = {
  rateProviders: Record<`0x${string}`, RateProvider>;
  handleRateProviderChange: (
    tokenAddress: `0x${string}`,
    update: Partial<RateProvider>,
  ) => void;
  disabled: boolean;
};

export default function RateProviderInputs({
  rateProviders,
  handleRateProviderChange,
  disabled,
}: Props) {
  // NOTE: in the final version of this component we will have this as an expandable section
  return (
    <section
      className={cn("flex w-full flex-col gap-4", disabled && "opacity-50")}
      title={disabled ? "You must select tokens to set rate providers" : ""}
    >
      <h4 className="self-start text-3xl font-semibold">Rate Providers</h4>
      <div className="flex w-full flex-col space-y-4">
        {Object.entries(rateProviders).map(([_, rateProvider]) => {
          return (
            <div className="space-y-3">
              <h4 className="font-semibold">{rateProvider.tokenSymbol}</h4>
              <InputWithLabel
                label="Address"
                disabled={false}
                value={rateProvider.providerAddress}
                onChange={(e) => {
                  handleRateProviderChange(rateProvider.tokenAddress, {
                    providerAddress: e.target.value as `0x${string}`, // NOTE: we verify this and set an error in the parent
                  });
                }}
              />
              <InputWithLabel
                label="Cache Duration"
                disabled={false}
                value={rateProvider.cacheDuration}
                onChange={(e) => {
                  if (e.target.value && !Number.isNaN(Number(e.target.value))) {
                    handleRateProviderChange(rateProvider.tokenAddress, {
                      cacheDuration: getSafeNumber(e.target.value),
                    });
                  }
                }}
              />
              {rateProvider.error && (
                <Alert variant="destructive" className="my-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{rateProvider.error}</AlertDescription>
                </Alert>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
