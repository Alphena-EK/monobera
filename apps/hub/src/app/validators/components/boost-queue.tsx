import { useMemo, useState } from "react";
import {
  BGT_ABI,
  IContractWrite,
  TransactionActionType,
  truncateHash,
  useBgtUnstakedBalance,
  useUserActiveValidators,
  useBeraJs,
  useAllValidators,
} from "@bera/berajs";
import { bgtTokenAddress } from "@bera/config";
import {
  FormattedNumber,
  Spinner,
  ValidatorIcon,
  useTxn,
} from "@bera/shared-ui";
import { cn } from "@bera/ui";
import { Button } from "@bera/ui/button";
import { Skeleton } from "@bera/ui/skeleton";
import { Address, parseUnits } from "viem";
import { useBlockNumber } from "wagmi";
import { ValidatorWithUserBoost } from "@bera/berajs/actions";

export const HISTORY_BUFFER = 8192;

export const BoostQueue = ({
  selectedValidator,
  isValidatorDataLoading,
  setIsValidatorDataLoading,
}: {
  selectedValidator?: string | undefined;
  isValidatorDataLoading?: boolean;
  setIsValidatorDataLoading: (loading: boolean) => void;
}) => {
  const { data = [], refresh } = useUserActiveValidators();
  const { refresh: refreshBalance } = useBgtUnstakedBalance();

  const { data: blockNumber } = useBlockNumber();

  const queuedList = useMemo(() => {
    return !data || !blockNumber || !data.length
      ? []
      : data
          .filter((validator) => {
            return parseFloat(validator.userBoosts.queuedBoosts) !== 0;
          })
          .map((validator) => {
            return {
              ...validator,
              canActivate:
                validator.userBoosts?.queueBoostStartBlock +
                  HISTORY_BUFFER -
                  Number(blockNumber) <=
                0,
            };
          })
          .filter((validator) => {
            return selectedValidator !== undefined
              ? validator.id.toLowerCase() === selectedValidator.toLowerCase()
              : true;
          });
  }, [data, blockNumber]);

  const [hasSubmittedTxn, setHasSubmittedTxn] = useState<
    Record<number, boolean>
  >({} as any);

  console.log({ hasSubmittedTxn });

  const {
    write: activateWrite,
    isLoading: isActivationLoading,
    ModalPortal: ActivateModalPortal,
  } = useTxn({
    message: "Activating queued BGT to Validator",
    actionType: TransactionActionType.DELEGATE,
    onSuccess: () => {
      setIsValidatorDataLoading(true);
      setTimeout(() => {
        refresh();
        refreshBalance();
        setHasSubmittedTxn({} as any);
        setIsValidatorDataLoading(false);
      }, 5000);
    },
  });

  const {
    write: cancelWrite,
    isLoading: isCancelLoading,
    ModalPortal: CancelModalPortal,
  } = useTxn({
    message: "Cancelling queued BGT to Validator",
    actionType: TransactionActionType.DELEGATE,
    onSuccess: () => {
      setIsValidatorDataLoading(true);
      setTimeout(() => {
        refresh();
        refreshBalance();
        setHasSubmittedTxn({} as any);
        setIsValidatorDataLoading(false);
      }, 5000);
    },
  });

  const handleTransaction = (
    index: number,
    isActivate: boolean,
    props: IContractWrite,
  ) => {
    console.log("handleTransaction", index, isActivate);

    setHasSubmittedTxn({ ...hasSubmittedTxn, [index]: true } as any);
    if (isActivate) {
      activateWrite(props);
    } else {
      cancelWrite(props);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {ActivateModalPortal}
      {CancelModalPortal}
      <div className="flex items-center">
        <div className="mr-2 text-lg font-semibold leading-7">Queued</div>
        {isValidatorDataLoading && <Spinner size={18} color="white" />}
      </div>

      {!queuedList ? (
        <div>
          <Skeleton className="h-28 w-full rounded-md" />
          <Skeleton className="h-28 w-full rounded-md" />
        </div>
      ) : (
        <>
          {queuedList?.map((validator, index: number) => (
            <ConfirmationCard
              key={validator.pubkey}
              userValidator={validator}
              index={index}
              hasSubmittedTxn={hasSubmittedTxn[index] ?? false}
              blocksLeft={
                Number(validator.userBoosts.queueBoostStartBlock) +
                HISTORY_BUFFER -
                Number(blockNumber)
              }
              isTxnLoading={isActivationLoading || isCancelLoading}
              handleTransaction={handleTransaction}
            />
          ))}
          {!queuedList?.length && (
            <div className="text-muted-foreground">No validators in queue</div>
          )}
        </>
      )}
    </div>
  );
};

const ConfirmationCard = ({
  userValidator,
  blocksLeft,
  isTxnLoading,
  index,
  hasSubmittedTxn,
  handleTransaction,
}: {
  userValidator: ValidatorWithUserBoost;
  blocksLeft: number;
  isTxnLoading: boolean;
  index: number;
  hasSubmittedTxn: boolean;
  handleTransaction: (
    index: number,
    isActivate: boolean,
    props: IContractWrite,
  ) => void;
}) => {
  const { data: block } = useBlockNumber();

  const { account } = useBeraJs();

  const isReadyForConfirmation =
    Number(userValidator.userBoosts.queueBoostStartBlock) +
      HISTORY_BUFFER -
      Number(block) <
    0;
  const width = isReadyForConfirmation
    ? 100
    : Math.round(Math.abs(1 - blocksLeft / HISTORY_BUFFER) * 100);

  console.log({
    block,
    userValidator,
    blocksLeft,
    isTxnLoading,
    hasSubmittedTxn,
  });

  const timeText = (
    <span className="text-info-foreground">{blocksLeft} blocks remaining</span>
  );

  const { data } = useAllValidators();

  const coinbase = userValidator.pubkey;
  const validatorInfo = data?.validators.find(
    (v) => v.pubkey.toLowerCase() === coinbase.toLowerCase(),
  );

  return (
    <div className="w-full rounded-md border border-border p-4">
      <div className="flex w-full justify-between">
        <div className="font-medium">
          <div className="flex items-center gap-2">
            <ValidatorIcon
              address={userValidator.pubkey as Address}
              className="h-8 w-8"
              // imgOverride={userValidator.metadata?.logoURI}
            />
            <div>
              {validatorInfo?.metadata?.name ??
                truncateHash(userValidator.pubkey)}
            </div>
          </div>
          <div className="ml-8 text-muted-foreground ">
            <FormattedNumber
              showIsSmallerThanMin
              value={userValidator.userBoosts.queuedBoosts}
              compact
            />{" "}
            BGT
          </div>
        </div>
        <div>
          <Button
            variant="ghost"
            disabled={
              isTxnLoading || !isReadyForConfirmation || hasSubmittedTxn
            }
            onClick={() =>
              handleTransaction(index, true, {
                address: bgtTokenAddress,
                abi: BGT_ABI,
                functionName: "activateBoost",
                params: [account!, userValidator.pubkey],
              })
            }
          >
            Confirm
          </Button>
          <Button
            variant="ghost"
            disabled={isTxnLoading || hasSubmittedTxn}
            onClick={() =>
              handleTransaction(index, false, {
                address: bgtTokenAddress,
                abi: BGT_ABI,
                functionName: "cancelBoost",
                params: [
                  userValidator.pubkey,
                  parseUnits(userValidator.userBoosts.queuedBoosts, 18),
                ],
              })
            }
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="mt-6 pl-8 pr-4">
        <div className="h-[9px] overflow-hidden rounded border border-border">
          <div
            className={cn(
              isReadyForConfirmation
                ? "bg-success-foreground"
                : "bg-info-foreground",
              "h-full",
            )}
            style={{ width: `${width}%` }}
          />
        </div>
        <div className="flex justify-between pt-2 text-sm font-medium leading-6">
          {blocksLeft < 0 ? (
            <div className="text-success-foreground">
              Ready for confirmation
            </div>
          ) : (
            <div>Confirmation Wait Duration</div>
          )}
          <div>{blocksLeft > 0 && timeText}</div>
        </div>
      </div>
    </div>
  );
};
