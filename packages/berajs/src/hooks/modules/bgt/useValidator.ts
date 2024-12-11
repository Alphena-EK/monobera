import { Address, keccak256 } from "viem";

import { Validator } from "~/types";
import { useOnChainValidator } from "./useOnChainValidator";
import { useSelectedValidator } from "./useSelectedValidator";
import { ApiValidatorFragment } from "@bera/graphql/pol/api";

export const useValidator = ({ pubkey }: { pubkey: Address }) => {
  const {
    data: indexerValidator,
    isLoading: isIndexerValidatorLoading,
    error: indexerValidatorError,
  } = useSelectedValidator(keccak256(pubkey));

  const {
    data: onChainValidator,
    isLoading: isOnChainValidatorLoading,
    error: onChainValidatorError,
  } = useOnChainValidator({ pubkey });

  return {
    data:
      indexerValidator || onChainValidator
        ? ({
            ...indexerValidator,
            ...onChainValidator,
            operator: onChainValidator?.operator ?? indexerValidator?.operator,
            coinbase: onChainValidator?.pubkey ?? indexerValidator?.pubkey,
            amountStaked:
              onChainValidator?.dynamicData?.amountStaked ??
              indexerValidator?.dynamicData?.amountStaked,
            metadata: onChainValidator?.metadata ?? indexerValidator?.metadata,
            id: onChainValidator?.id ?? indexerValidator?.id,
          } as ApiValidatorFragment)
        : null,
    isLoading: isIndexerValidatorLoading || isOnChainValidatorLoading,
    error: indexerValidatorError || onChainValidatorError,
  };
};
