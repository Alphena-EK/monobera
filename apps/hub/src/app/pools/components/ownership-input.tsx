"use client";

import React from "react";
import { SwapFeeInput } from "@bera/shared-ui";
import { cn } from "@bera/ui";
import { Alert, AlertDescription, AlertTitle } from "@bera/ui/alert";
import { Card } from "@bera/ui/card";
import { InputWithLabel } from "@bera/ui/input";

import BeraTooltip from "~/components/bera-tooltip";

export type OwnershipType = "governance" | "fixed" | "custom";

interface OwnershipInputProps {
  ownershipType: OwnershipType;
  owner: string;
  onChangeOwnershipType: (type: OwnershipType) => void;
  onOwnerChange: (address: string) => void;
  invalidAddressErrorMessage: string | null;
  swapFee: number;
  onSwapFeeChange: (fee: number) => void;
}

const OwnershipInput: React.FC<OwnershipInputProps> = ({
  ownershipType,
  owner,
  onChangeOwnershipType,
  onOwnerChange,
  invalidAddressErrorMessage,
  swapFee,
  onSwapFeeChange,
}) => {
  return (
    <section className="flex w-full flex-col gap-4">
      <h3 className="self-start text-3xl font-semibold">Set Swap Fee</h3>
      <SwapFeeInput initialFee={swapFee} onFeeChange={onSwapFeeChange} />

      <div className="flex items-center gap-1">
        <div className="self-start font-semibold">Fee Ownership</div>
        <div className="pt-[-1]">
          <BeraTooltip
            size="lg"
            wrap
            text={`The owner of the pool can make changes such as setting the swap fee. 
                   Use address 0x0000...0000 to fix the fee or allow governance by using 
                   the delegated address.`}
          />
        </div>
      </div>

      <div className="flex w-full flex-row gap-6">
        <Card
          onClick={() => onChangeOwnershipType("governance")}
          className={cn(
            "flex w-full cursor-pointer flex-col gap-0 border border-border p-4",
            ownershipType === "governance" && "border-info-foreground ",
          )}
        >
          <span className="text-lg font-semibold">Governance</span>
          <span className="mt-[-4px] text-sm text-muted-foreground">
            Enables fee modification through governance
          </span>
        </Card>
        <Card
          onClick={() => onChangeOwnershipType("fixed")}
          className={cn(
            "flex w-full cursor-pointer flex-col gap-0 border border-border p-4",
            ownershipType === "fixed" && "border-info-foreground ",
          )}
        >
          <span className="text-lg font-semibold">Fixed</span>
          <span className="mt-[-4px] text-sm text-muted-foreground">
            Fee is fixed and unmodifiable
          </span>
        </Card>
        <Card
          onClick={() => onChangeOwnershipType("custom")}
          className={cn(
            "flex w-full cursor-pointer flex-col gap-0 border border-border p-4",
            ownershipType === "custom" && "border-info-foreground ",
          )}
        >
          <span className="text-lg font-semibold">Custom Address</span>
          <span className="mt-[-4px] text-sm text-muted-foreground">
            Update fees through a custom address
          </span>
        </Card>
      </div>
      <div className="pt-2">
        <InputWithLabel
          label="Owner Address"
          disabled={ownershipType !== "custom"}
          variant="black"
          className="bg-transparent"
          value={owner}
          maxLength={42}
          onChange={(e) => {
            const value = e.target.value;
            onOwnerChange(value);
          }}
        />
        {invalidAddressErrorMessage && (
          <Alert variant="destructive" className="my-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{invalidAddressErrorMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    </section>
  );
};

export default OwnershipInput;
