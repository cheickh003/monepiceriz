import React from 'react'
import { Link } from '@inertiajs/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationLink {
    url: string | null
    label: string
    active: boolean
}

interface PaginationProps {
    links: PaginationLink[]
    className?: string
}

export function Pagination({ links, className }: PaginationProps) {
    return (
        <nav className={cn("flex items-center justify-center space-x-2", className)}>
            {links.map((link, index) => {
                const isPageNumber = !link.label.includes('Previous') && !link.label.includes('Next')
                const isPrevious = link.label.includes('Previous')
                const isNext = link.label.includes('Next')
                
                if (!link.url) {
                    if (isPrevious || isNext) {
                        return (
                            <span
                                key={index}
                                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-300 cursor-not-allowed rounded-md"
                            >
                                {isPrevious ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </span>
                        )
                    }
                    
                    if (isPageNumber) {
                        return (
                            <span
                                key={index}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 cursor-not-allowed rounded-md"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    }
                    
                    return null
                }

                if (isPrevious || isNext) {
                    return (
                        <Link
                            key={index}
                            href={link.url}
                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            {isPrevious ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Link>
                    )
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={cn(
                            "relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md",
                            link.active
                                ? "z-10 bg-primary text-primary-foreground border-primary"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            })}
        </nav>
    )
}

// Alternative pagination component for simpler use cases
export function SimplePagination({ 
    currentPage, 
    totalPages, 
    onPageChange 
}: { 
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void 
}) {
    const pages = []
    const maxVisible = 7
    
    if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i)
        }
    } else {
        if (currentPage <= 3) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i)
            }
            pages.push('...')
            pages.push(totalPages)
        } else if (currentPage >= totalPages - 2) {
            pages.push(1)
            pages.push('...')
            for (let i = totalPages - 4; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1)
            pages.push('...')
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                pages.push(i)
            }
            pages.push('...')
            pages.push(totalPages)
        }
    }
    
    return (
        <nav className="flex items-center justify-center space-x-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            
            {pages.map((page, index) => {
                if (page === '...') {
                    return (
                        <span key={index} className="px-2 py-2 text-gray-500">
                            ...
                        </span>
                    )
                }
                
                return (
                    <button
                        key={index}
                        onClick={() => onPageChange(page as number)}
                        className={cn(
                            "relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md",
                            currentPage === page
                                ? "z-10 bg-primary text-primary-foreground"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        {page}
                    </button>
                )
            })}
            
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </nav>
    )
}