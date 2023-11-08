import Image from "next/image";
import { cn } from "@bera/ui";

import { type IMarket } from "../berpetuals/page";

export function PositionTitle({
  market,
  type,
  className,
}: {
  market: IMarket;
  type: "Long" | "Short";
  className?: string;
}) {
  return (
    <div className={cn("flex w-[112px] items-center gap-2", className)}>
      <Image
        src={market?.imageUri ?? ""}
        alt={"selectedMarket"}
        width={24}
        height={24}
        className="rounded-full"
      />{" "}
      <div>
        <div className="mt-1 text-sm font-semibold leading-tight text-foreground">
          {market?.name}
        </div>
        <div
          className={cn(
            "mt-1 text-sm font-medium leading-tight",
            type === "Long"
              ? "text-success-foreground"
              : "text-destructive-foreground",
          )}
        >
          {type}
        </div>
      </div>
    </div>
  );
}

export function PositionCardTitle({
  market,
  type,
  className,
  size,
}: {
  market: IMarket;
  type: "Long" | "Short";
  className?: string;
  size: number;
}) {
  return (
    <div
      className={cn(
        "flex flex-row items-center  justify-between gap-1 ",
        className,
      )}
    >
      <div className="flex flex-row items-center  justify-between gap-1">
        <Image
          src={market?.imageUri ?? ""}
          alt={"selectedMarket"}
          width={24}
          height={24}
          className="rounded-full"
        />{" "}
        <div className="text-sm font-semibold leading-tight text-foreground">
          {market?.name} {" / "}
        </div>
        <div
          className={cn(
            " text-sm font-medium leading-tight",
            type === "Long"
              ? "text-success-foreground"
              : "text-destructive-foreground",
          )}
        >
          {type}
        </div>
      </div>
      <div className="text-sm font-semibold leading-tight text-muted-foreground">
        {size.toFixed(4) ?? 0} {market?.name.split("-")[0]}
      </div>
    </div>
  );
}