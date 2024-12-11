import React, { useCallback, useMemo, useState } from "react";
import {
  useAllValidators,
  useUserActiveValidators,
  type UserValidator,
} from "@bera/berajs";
import { SimpleTable, useAsyncTable } from "@bera/shared-ui";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
  TableState,
  Updater,
} from "@tanstack/react-table";

import { generalValidatorColumns } from "~/columns/general-validator-columns";

const VALIDATOR_PAGE_SIZE = 10;

export const AllValidator = ({
  keyword,
  isTyping,
  onRowClick,
  onRowHover,
  page,
  setPage,
}: {
  keyword?: any;
  isTyping?: boolean;
  onRowClick?: any;
  onRowHover?: any;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "votingpower", desc: true },
  ]);

  const {
    data: validatorData,
    isLoading,
    isValidating,
  } = useAllValidators({
    sortBy: sorting[0]?.id as "commission" | "apy" | "votingpower" | undefined,
    sortOrder: sorting[0]?.desc ? "desc" : "asc",
    page: page + 1,
    pageSize: VALIDATOR_PAGE_SIZE,
    query: isTyping ? "" : keyword,
  });

  const {
    data = [],
    isLoading: isUserLoading,
    isValidating: isUserValidating,
  } = useUserActiveValidators();

  const validators = validatorData?.validators ?? [];

  const fetchData = useCallback(
    (state: TableState) => {
      setPage(state?.pagination?.pageIndex);
      setSorting(state?.sorting);
    },
    [setPage],
  );

  const handlePaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      setPage((prev: number) => {
        const newPaginationState =
          typeof updater === "function"
            ? updater({
                pageIndex: prev ?? 0,
                pageSize: VALIDATOR_PAGE_SIZE,
              })
            : updater;
        return newPaginationState.pageIndex ?? 0;
      });
    },
    [setPage],
  );

  const allValidatorTable = useAsyncTable({
    fetchData: fetchData,
    columns: generalValidatorColumns,
    data: validators ?? [],
    enablePagination: true,
    additionalTableProps: {
      meta: {
        loading: isLoading || isUserLoading,
        loadingText: "Loading...",
        validating: isValidating || isUserValidating,
      },
      initialState: {
        pagination: {
          pageIndex: page,
          pageSize: VALIDATOR_PAGE_SIZE,
        },
      },
      autoResetPageIndex: false,
      pageCount: Math.ceil(validators.length / VALIDATOR_PAGE_SIZE),
      onPaginationChange: handlePaginationChange,
    },
  });

  return (
    <SimpleTable
      table={allValidatorTable}
      className="min-h-[614px]"
      flexTable
      wrapperClassName="min-h-[614px]"
      variant="ghost"
      onRowClick={onRowClick}
      onRowHover={onRowHover}
      mutedBackgroundOnHead={false}
    />
  );
};
