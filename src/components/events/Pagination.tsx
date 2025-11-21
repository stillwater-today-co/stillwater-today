import React, { useEffect, useState } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState<string>(String(currentPage))

  useEffect(() => {
    setInputValue(String(currentPage))
  }, [currentPage])
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 4) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 2)
      const end = Math.min(totalPages - 1, currentPage + 2)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 3) {
        pages.push('...')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="pagination">
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
      
      <div className="pagination-controls">
        {/* Previous button */}
        <button
          className="pagination-btn prev-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          title="Previous page"
        >
          ‹
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === 'number' ? (
              <button
                className={`pagination-btn page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
                disabled={disabled}
              >
                {page}
              </button>
            ) : (
              <span className="pagination-ellipsis">{page}</span>
            )}
          </React.Fragment>
        ))}

        {/* Next button */}
        <button
          className="pagination-btn next-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          title="Next page"
        >
          ›
        </button>
      </div>

      {/* Removed 'Go to' box */}
    </div>
  )
}

export default Pagination