"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  startIndex: number
  endIndex: number
  className?: string
}

const itemsPerPageOptions = [10, 25, 50, 100, 200]
const LOCAL_STORAGE_ITEMS_PER_PAGE_KEY = "paginationItemsPerPage" // Define a key for localStorage

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  // itemsPerPage, // Remove this from props, it will be managed internally
  onPageChange,
  onItemsPerPageChange,
  startIndex,
  endIndex,
  className = "",
}: PaginationProps) {
  const [inputPage, setInputPage] = useState(String(currentPage)) // New state for input value

  // Internal state for itemsPerPage, initialized from localStorage
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedItemsPerPage = localStorage.getItem(LOCAL_STORAGE_ITEMS_PER_PAGE_KEY)
      return savedItemsPerPage ? Number.parseInt(savedItemsPerPage, 10) : 10
    }
    return 10 // Default if not in browser environment
  })

  // Effect to save itemsPerPage to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_ITEMS_PER_PAGE_KEY, String(itemsPerPage))
    }
    // Also call the prop function to notify parent component
    onItemsPerPageChange(itemsPerPage)
  }, [itemsPerPage, onItemsPerPageChange])

  // Update inputPage when currentPage prop changes (e.g., from external pagination)
  useEffect(() => {
    setInputPage(String(currentPage))
  }, [currentPage])

  // Generate page numbers to display
  const generatePageNumbers = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const range = []
    const rangeWithDots = []

    // Calculate start and end of the range
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, currentPage + delta)

    // Generate the range
    for (let i = start; i <= end; i++) {
      range.push(i)
    }

    // Add first page and dots if necessary
    if (start > 1) {
      rangeWithDots.push(1)
      if (start > 2) {
        rangeWithDots.push("...")
      }
    }

    // Add the main range
    rangeWithDots.push(...range)

    // Add last page and dots if necessary
    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push("...")
      }
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const pageNumbers = generatePageNumbers()

  const handlePageChangeInternal = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const handleInputPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value)
  }

  const handleInputPageBlur = () => {
    const page = Number.parseInt(inputPage, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChangeInternal(page)
    } else {
      setInputPage(String(currentPage)) // Revert to current page if invalid
    }
  }

  const handleInputPageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur() // Trigger blur to handle validation
    }
  }

  const handleItemsPerPageChangeInternal = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage) // Update internal state
  }

  return (
    <div className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="px-4 py-3 sm:px-6">
        {/* Mobile View */}
        <div className="flex items-center justify-between sm:hidden">
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              <span className="font-medium">{startIndex + 1}</span>
              {" - "}
              <span className="font-medium">{Math.min(endIndex, totalItems)}</span>
              {" của "}
              <span className="font-medium">{totalItems.toLocaleString("vi-VN")}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChangeInternal(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center text-sm text-gray-700">
              <input
                type="number"
                value={inputPage}
                onChange={handleInputPageChange}
                onBlur={handleInputPageBlur}
                onKeyDown={handleInputPageKeyDown}
                min="1"
                max={totalPages}
                className="w-12 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none py-1 px-0.5"
                aria-label={`Trang hiện tại ${currentPage} trên tổng số ${totalPages}`}
              />
              <span className="ml-1">/ {totalPages}</span>
            </div>
            <button
              onClick={() => handlePageChangeInternal(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">{startIndex + 1}</span>
              {" - "}
              <span className="font-medium">{Math.min(endIndex, totalItems)}</span>
              {" của "}
              <span className="font-medium">{totalItems.toLocaleString("vi-VN")}</span>
            </p>
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPageMobile" className="text-sm text-gray-700">
                Hiển thị:
              </label>
              <select
                id="itemsPerPageMobile"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChangeInternal(Number(e.target.value))}
                className="block w-auto px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChangeInternal(1)}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Trang đầu"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChangeInternal(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center text-sm text-gray-700">
              <input
                type="number"
                value={inputPage}
                onChange={handleInputPageChange}
                onBlur={handleInputPageBlur}
                onKeyDown={handleInputPageKeyDown}
                min="1"
                max={totalPages}
                className="w-12 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none py-1 px-0.5"
                aria-label={`Trang hiện tại ${currentPage} trên tổng số ${totalPages}`}
              />
              <span className="ml-1">/ {totalPages}</span>
            </div>
            <button
              onClick={() => handlePageChangeInternal(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => handlePageChangeInternal(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Trang cuối"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>

        {/* Page info for mobile (below the controls) */}
        <div className="mt-3 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPageMobile" className="text-sm text-gray-700">
                Hiển thị:
              </label>
              <select
                id="itemsPerPageMobile"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChangeInternal(Number(e.target.value))}
                className="block w-auto px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChangeInternal(1)}
                disabled={currentPage === 1}
                className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang đầu"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => handlePageChangeInternal(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang cuối"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
