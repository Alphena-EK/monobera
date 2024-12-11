import { useMemo, useState } from "react";
import { useUserActiveValidators } from "@bera/berajs";
import { FormattedNumber, Spinner } from "@bera/shared-ui";
import { Icons } from "@bera/ui/icons";
import { Skeleton } from "@bera/ui/skeleton";
import { Address } from "viem";

import { BoostQueue } from "../components/boost-queue";
import { DelegateModal } from "./delegate-modal";
import { UnbondModal } from "./unbond-modal";

export const UserDelegation = ({ valPubKey }: { valPubKey: Address }) => {
  const { data = [], isLoading } = useUserActiveValidators();
  const [isValidatorDataLoading, setIsValidatorDataLoading] = useState(false);

  const userStaked = useMemo(() => {
    return data.find(
      (userValidator) =>
        userValidator.pubkey.toLowerCase() === valPubKey.toLowerCase(),
    );
  }, [data]);
  return (
    <div className="flex flex-col gap-4 rounded-sm border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2 text-xl font-semibold">Your Boosts</div>
          {isValidatorDataLoading && <Spinner size={18} color="white" />}
        </div>
        <div className="flex gap-2">
          {userStaked ? (
            <UnbondModal
              userValidator={userStaked}
              setIsValidatorDataLoading={setIsValidatorDataLoading}
            />
          ) : null}
          <DelegateModal
            validator={valPubKey}
            setIsValidatorDataLoading={setIsValidatorDataLoading}
          />
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="h-full w-full" />
      ) : (
        <>
          {!userStaked ? (
            <div className="flex h-full w-full items-center justify-center text-center text-sm font-medium leading-5 text-muted-foreground">
              You have no current or queued delegations
              <br />
              in this validator.
            </div>
          ) : (
            <>
              <div className="w-full">
                <div className="font-medium leading-6">
                  <div className="flex items-center gap-1">
                    <FormattedNumber
                      value={userStaked?.amountDeposited ?? "0"}
                    />{" "}
                    <Icons.bgt className="ml-1 h-4 w-4" />
                    BGT
                  </div>
                </div>
              </div>
              <hr />
              {/* {ActivateModalPortal}
              {CancelModalPortal} */}
              {/* <ConfirmationCard
                index={0} //@ts-ignore
                userValidator={userValidator}
                hasSubmittedTxn={hasSubmittedTxn[0] ?? false}
                isTxnLoading={isActivationLoading || isCancelLoading}
                handleTransaction={handleTransaction}
              /> */}
              <BoostQueue
                setIsValidatorDataLoading={setIsValidatorDataLoading}
                selectedValidator={valPubKey as string}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
