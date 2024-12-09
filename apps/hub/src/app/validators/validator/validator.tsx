"use client";

import React from "react";
import { notFound } from "next/navigation";
import { useSelectedValidator, useValidator } from "@bera/berajs";
import { type Address } from "viem";

import { ValidatorTabs } from "../components/validator-tabs";
import ValidatorDetails from "./validator-details";

export default function Validator({
  validatorAddress,
}: {
  validatorAddress: Address;
}) {
  const {
    data: validator,
    isLoading: isValidatorLoading,
    error,
  } = useValidator({ pubkey: validatorAddress });

  if (!isValidatorLoading && !validator) return notFound();

  return validator?.operator ? (
    <>
      <div className="relative flex flex-col">
        <ValidatorDetails validator={validator} />
        <ValidatorTabs validator={validator} />
      </div>
    </>
  ) : null;
}
