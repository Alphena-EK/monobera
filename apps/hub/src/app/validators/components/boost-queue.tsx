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
  useUserBoostsOnValidator,
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

type QueueItem = ValidatorWithUserBoost & {
  canActivate: boolean;
  type: "boost" | "dropBoost";
};

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

  const { data: userBoosts, refresh: refreshUserBoosts } =
    useUserBoostsOnValidator({
      pubkey: selectedValidator as Address | undefined,
    });

  const { data: blockNumber } = useBlockNumber();

  const queuedList = useMemo(() => {
    return !data || !blockNumber || !data.length
      ? []
      : data.flatMap((validator) => {
          if (selectedValidator) {
            if (
              validator.pubkey.toLowerCase() !== selectedValidator.toLowerCase()
            ) {
              return [];
            }
            if (userBoosts) {
              validator.userBoosts = userBoosts;
            }
          }

          const items: QueueItem[] = [];

          if (Number(validator.userBoosts.queuedBoosts) > 0) {
            items.push({
              ...validator,
              canActivate:
                validator.userBoosts?.queueBoostStartBlock +
                  HISTORY_BUFFER -
                  Number(blockNumber) <=
                0,
              type: "boost",
            });
          }

          if (Number(validator.userBoosts.queuedUnboosts) > 0) {
            items.push({
              ...validator,
              canActivate:
                validator.userBoosts?.queueUnboostStartBlock +
                  HISTORY_BUFFER -
                  Number(blockNumber) <=
                0,
              type: "dropBoost",
            });
          }

          return items;
        });
  }, [data, blockNumber, userBoosts]);

  const [hasSubmittedTxn, setHasSubmittedTxn] = useState<
    Record<number, boolean>
  >({} as any);

  const {
    write: activateWrite,
    isLoading: isActivationLoading,
    ModalPortal: ActivateModalPortal,
  } = useTxn({
    message: "Activating queued BGT to Validator",
    actionType: TransactionActionType.DELEGATE,
    onError: () => {
      setHasSubmittedTxn({} as any);
    },
    onSuccess: () => {
      setIsValidatorDataLoading(true);
      setTimeout(() => {
        refresh();
        refreshBalance();
        refreshUserBoosts();
        setHasSubmittedTxn({} as any);
        setIsValidatorDataLoading(false);
      }, 5000);
    },
  });

  const {
    write: dropBoostWrite,
    isLoading: isDropBoostLoading,
    ModalPortal: DropBoostModalPortal,
  } = useTxn({
    message: "Confirming queued boost drop to validator",
    actionType: TransactionActionType.DELEGATE,
    onError: () => {
      setHasSubmittedTxn({} as any);
    },
    onSuccess: () => {
      refresh();
      refreshBalance();
      refreshUserBoosts();
      setHasSubmittedTxn({} as any);
      setIsValidatorDataLoading(false);
    },
  });

  const {
    write: cancelWrite,
    isLoading: isCancelLoading,
    ModalPortal: CancelModalPortal,
  } = useTxn({
    message: "Cancelling queued BGT to Validator",
    actionType: TransactionActionType.DELEGATE,
    onError: () => {
      setHasSubmittedTxn({} as any);
    },
    onSuccess: () => {
      setIsValidatorDataLoading(true);
      setTimeout(() => {
        refresh();
        refreshBalance();
        refreshUserBoosts();
        setHasSubmittedTxn({} as any);
        setIsValidatorDataLoading(false);
      }, 5000);
    },
  });

  const {
    write: cancelDropBoostWrite,
    isLoading: isCancelDropBoostLoading,
    ModalPortal: CancelDropBoostModalPortal,
  } = useTxn({
    message: "Cancelling queued drop boost to Validator",
    actionType: TransactionActionType.DELEGATE,
    onError: () => {
      setHasSubmittedTxn({} as any);
    },
    onSuccess: () => {
      setIsValidatorDataLoading(true);
      setTimeout(() => {
        refresh();
        refreshBalance();
        refreshUserBoosts();
        setHasSubmittedTxn({} as any);
        setIsValidatorDataLoading(false);
      }, 5000);
    },
  });

  const handleTransaction = (
    index: number,
    isActivate: boolean,
    props: IContractWrite,
    isDropBoost: boolean,
  ) => {
    setHasSubmittedTxn({ ...hasSubmittedTxn, [index]: true } as any);

    if (isActivate) {
      if (isDropBoost) {
        dropBoostWrite(props);
      } else {
        activateWrite(props);
      }
    } else {
      if (isDropBoost) {
        cancelDropBoostWrite(props);
      } else {
        cancelWrite(props);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {ActivateModalPortal}
      {CancelModalPortal}
      {CancelDropBoostModalPortal}
      {DropBoostModalPortal}
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
  isTxnLoading,
  index,
  hasSubmittedTxn,
  handleTransaction,
}: {
  userValidator: QueueItem;
  isTxnLoading: boolean;
  index: number;
  hasSubmittedTxn: boolean;
  handleTransaction: (
    index: number,
    isActivate: boolean,
    props: IContractWrite<typeof BGT_ABI>,
    isDropBoost: boolean,
  ) => void;
}) => {
  const { data: block } = useBlockNumber();

  const { account } = useBeraJs();

  const amount =
    userValidator.type === "boost"
      ? userValidator.userBoosts.queuedBoosts
      : userValidator.userBoosts.queuedUnboosts;
  const startBlock =
    userValidator.type === "boost"
      ? userValidator.userBoosts.queueBoostStartBlock
      : userValidator.userBoosts.queueUnboostStartBlock;

  const blocksLeft = Number(startBlock) + HISTORY_BUFFER - Number(block);

  const isReadyForConfirmation = blocksLeft <= 0;

  const width = isReadyForConfirmation
    ? 100
    : Math.round(Math.abs(1 - blocksLeft / HISTORY_BUFFER) * 100);

  const timeText = (
    <span className="text-info-foreground">{blocksLeft} blocks remaining</span>
  );

  const { data } = useAllValidators();

  const pubkey = userValidator.pubkey;
  const validatorInfo = data?.validators.find(
    (v) => v.pubkey.toLowerCase() === pubkey.toLowerCase(),
  );

  return (
    <div className="w-full rounded-md border border-border p-4">
      <div className="flex w-full justify-between">
        <div className="font-medium">
          <div className="flex items-center gap-2">
            <ValidatorIcon
              address={userValidator.pubkey as Address}
              className="h-8 w-8"
            />
            <div>
              {validatorInfo?.metadata?.name ??
                truncateHash(userValidator.pubkey)}
            </div>
          </div>
          <div className="ml-8 text-muted-foreground ">
            <FormattedNumber
              showIsSmallerThanMin
              value={userValidator.type === "boost" ? amount : -Number(amount)}
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
              handleTransaction(
                index,
                true,
                {
                  address: bgtTokenAddress,
                  abi: BGT_ABI,
                  functionName:
                    userValidator.type === "boost"
                      ? "activateBoost"
                      : "dropBoost",
                  params: [account!, userValidator.pubkey as Address],
                },
                userValidator.type === "dropBoost",
              )
            }
          >
            Confirm
          </Button>
          <Button
            variant="ghost"
            disabled={isTxnLoading || hasSubmittedTxn}
            onClick={() =>
              handleTransaction(
                index,
                false,
                {
                  address: bgtTokenAddress,
                  abi: BGT_ABI,
                  functionName:
                    userValidator.type === "boost"
                      ? "cancelBoost"
                      : "cancelDropBoost",
                  params: [
                    userValidator.pubkey as Address,
                    parseUnits(amount, 18),
                  ],
                },
                userValidator.type === "dropBoost",
              )
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
