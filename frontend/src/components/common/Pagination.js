import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';

const Pagination = ({ paginationData, onPageChange, className = "" }) => {
    if (!paginationData || !paginationData.hasToPaginate) {
        return null;
    }

    const {
        currentPage,
        lastPage,
        hasPreviousPage,
        hasNextPage,
        previousPage,
        nextPage
    } = paginationData;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= lastPage && page !== currentPage) {
            onPageChange(page);
        }
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (lastPage <= maxVisiblePages) {
            // Show all pages if total pages are less than max visible
            for (let i = 1; i <= lastPage; i++) {
                pages.push(i);
            }
        } else {
            // Show pages around current page
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let startPage = Math.max(1, currentPage - halfVisible);
            let endPage = Math.min(lastPage, startPage + maxVisiblePages - 1);

            // Adjust start page if we're near the end
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            // Add first page and ellipsis if needed
            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) {
                    pages.push('...');
                }
            }

            // Add page numbers in range
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Add ellipsis and last page if needed
            if (endPage < lastPage) {
                if (endPage < lastPage - 1) {
                    pages.push('...');
                }
                pages.push(lastPage);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={`d-flex justify-content-between align-items-center ${className}`}>
            <div className="text-muted">
                Showing page {currentPage} of {lastPage} ({paginationData.totalResults} total results)
            </div>

            <BootstrapPagination className="mb-0">
                <BootstrapPagination.First
                    disabled={!hasPreviousPage}
                    onClick={() => handlePageChange(1)}
                />
                <BootstrapPagination.Prev
                    disabled={!hasPreviousPage}
                    onClick={() => handlePageChange(previousPage)}
                />

                {pageNumbers.map((page, index) => {
                    if (page === '...') {
                        return (
                            <BootstrapPagination.Ellipsis key={`ellipsis-${index}`} disabled />
                        );
                    }

                    return (
                        <BootstrapPagination.Item
                            key={page}
                            active={page === currentPage}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </BootstrapPagination.Item>
                    );
                })}

                <BootstrapPagination.Next
                    disabled={!hasNextPage}
                    onClick={() => handlePageChange(nextPage)}
                />
                <BootstrapPagination.Last
                    disabled={!hasNextPage}
                    onClick={() => handlePageChange(lastPage)}
                />
            </BootstrapPagination>
        </div>
    );
};

export default Pagination;