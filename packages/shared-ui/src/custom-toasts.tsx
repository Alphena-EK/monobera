"use client";

import { useBeraConfig } from "@bera/berajs";
import { cn } from "@bera/ui";
import { Icons } from "@bera/ui/icons";

import { Spinner } from "./spinner";

interface IToast {
  title: string;
  message?: string;
  hash?: string;
  description?: string;
  onClose: () => void;
}

interface IBaseToast {
  title: string;
  href?: string;
  onClose?: () => void;
  duration?: number;
  className?: string;
  startAdornment?: React.ReactNode;
  description?: string;
}

const BaseToast = ({
  title,
  href,
  className = "",
  startAdornment,
  description,
}: IBaseToast) => {
  return (
    <div
      className={cn(
        "z-50 w-[350px] flex flex-col rounded-md  p-4 text-white shadow",
        className,
      )}
      style={{ background: "#292524", zIndex: 500 }} // i dont know why this is needed, but we ball 🤮
    >
      <div className="flex flex-row gap-2 text-sm font-semibold text-white">
        <div className="flex flex-0 items-center">
          {startAdornment && startAdornment}
        </div>
        <span className="flex-1 line-clamp-2" title={title}>
          {title}
        </span>
        {href && (
          <a
            href={href}
            className="flex flex-row gap-2 flex-0 items-center"
            target="_blank"
            rel="noreferrer"
          >
            <p className="text-sm font-normal">View Txn</p>
            <Icons.external className="h-4 w-4" />
          </a>
        )}
      </div>
      {description && (
        <>
          <div className="my-2 w-[311px] h-[0px] border" />
          <span
            title={description}
            className="w-[311px] text-stone-500 text-xs font-medium font-['IBM Plex Sans'] leading-tight line-clamp-2"
          >
            {description}
          </span>
        </>
      )}
    </div>
  );
};
export const SuccessToast = ({
  title = "Success",
  hash = undefined,
  description,
  onClose,
}: IToast) => {
  const { networkConfig } = useBeraConfig();

  return (
    <BaseToast
      title={title}
      onClose={onClose}
      description={description}
      startAdornment={<Icons.checkCircle className="h-6 w-6 text-positive" />}
      href={
        hash
          ? `${networkConfig.chain.blockExplorers?.default.url}/tx/${hash}`
          : undefined
      }
    />
  );
};

export const ErrorToast = ({
  title = "Error",
  onClose,
  description,
}: IToast) => {
  // HANDLE ERROR MESSAGES
  if (title === "User rejected txn") {
    return (
      <BaseToast
        title={title}
        onClose={onClose}
        startAdornment={
          <Icons.userX className="h-6 w-6 text-destructive-foreground" />
        }
      />
    );
  }
  return (
    // TODO: txn handle txn hash
    <BaseToast
      title={title}
      onClose={onClose}
      description={description}
      startAdornment={
        <Icons.XOctagon className="h-6 w-6 text-destructive-foreground" />
      }
      // href={
      //   hash
      //     ? `${networkConfig.chain.blockExplorers?.default.url}/tx/${hash}`
      //     : undefined
      // }
    />
  );
};

export const SubmissionToast = ({
  title = "Submitting",
  hash = undefined,
  description,
  onClose,
}: IToast) => {
  const { networkConfig } = useBeraConfig();

  return (
    <BaseToast
      title={title}
      onClose={onClose}
      description={description}
      startAdornment={<Spinner size={18} color="#f8b613" />}
      href={
        hash
          ? `${networkConfig.chain.blockExplorers?.default.url}/tx/${hash}`
          : undefined
      }
    />
  );
};

export const LoadingToast = ({
  title = "Loading",
  description,
  onClose,
}: IToast) => {
  return (
    <BaseToast
      title={title}
      onClose={onClose}
      description={description}
      startAdornment={<Spinner size={18} color="#f8b613" />}
    />
  );
};
