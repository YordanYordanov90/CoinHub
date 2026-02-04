'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from '@/components/ui/pagination';
import { useRouter } from 'next/navigation';
import { buildPageNumbers, cn, ELLIPSIS } from '@/lib/utils';

const CoinsPagination = ({ currentPage, totalPages, hasMorePages }: Pagination) => {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    router.push(`/coins?page=${page}`);
  };

  const pageNumbers = buildPageNumbers(currentPage, totalPages);
  const isLastPage = !hasMorePages || currentPage === totalPages;

  return (
    <Pagination id="coins-pagination" className="mt-6">
      <PaginationContent className="flex flex-row flex-wrap items-center justify-center gap-2">
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) handlePageChange(currentPage - 1);
            }}
            className={cn(
              'cursor-pointer border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
              currentPage === 1 && 'pointer-events-none opacity-50',
            )}
          />
        </PaginationItem>

        {pageNumbers.map((page, index) => (
          <PaginationItem key={`${page}-${index}`}>
            {page === ELLIPSIS ? (
              <span
                className="flex size-9 items-center justify-center px-2 text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <PaginationLink
                isActive={currentPage === page}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page);
                }}
                href={`/coins?page=${page}`}
                className={cn(
                  'min-w-9 cursor-pointer select-none',
                  currentPage === page &&
                    'border-border bg-accent text-accent-foreground pointer-events-none',
                )}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              if (!isLastPage) handlePageChange(currentPage + 1);
            }}
            className={cn(
              'cursor-pointer border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
              isLastPage && 'pointer-events-none opacity-50',
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CoinsPagination;