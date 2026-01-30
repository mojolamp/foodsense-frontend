/**
 * Loading Fallback Components
 * ===========================
 *
 * Reusable loading states for lazy-loaded components.
 * Provides better UX than blank screens during code splitting.
 */

import React from 'react';

/**
 * Generic spinner loader
 */
export function SpinnerLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`animate-spin border-blue-500 border-t-transparent rounded-full ${sizeClasses[size]}`}
      />
    </div>
  );
}

/**
 * Modal loading skeleton
 */
export function ModalSkeleton() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="animate-pulse">
          {/* Header */}
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />

          {/* Content */}
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>

          {/* Footer buttons */}
          <div className="flex gap-2 justify-end">
            <div className="h-10 bg-gray-200 rounded w-20" />
            <div className="h-10 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Table loading skeleton
 */
export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="w-full">
      <div className="animate-pulse">
        {/* Table header */}
        <div className="flex gap-4 mb-4 pb-2 border-b">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>

        {/* Table rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 mb-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Chart/Graph loading skeleton
 */
export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`w-full ${height} flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200`}>
      <div className="text-center">
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-32 bg-gray-300 rounded mx-auto" />
          <div className="h-3 w-24 bg-gray-300 rounded mx-auto" />
        </div>
        <div className="mt-4">
          <SpinnerLoader size="sm" />
        </div>
      </div>
    </div>
  );
}

/**
 * Card loading skeleton
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
}

/**
 * Drawer loading skeleton
 */
export function DrawerSkeleton() {
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg z-50 p-6">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-6 w-6 bg-gray-200 rounded" />
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>

          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>

          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Page loading skeleton
 */
export function PageSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="animate-pulse">
        {/* Page title */}
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />

        {/* Content grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Main content */}
        <div className="bg-white rounded-lg shadow p-6">
          <TableSkeleton rows={8} />
        </div>
      </div>
    </div>
  );
}

/**
 * List item loading skeleton
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b animate-pulse">
      <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="h-8 w-8 bg-gray-200 rounded" />
    </div>
  );
}

/**
 * List loading skeleton
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="bg-white rounded-lg shadow">
      {Array.from({ length: items }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Form loading skeleton
 */
export function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>

      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>

      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
        <div className="h-24 bg-gray-200 rounded w-full" />
      </div>

      <div className="flex gap-2 pt-4">
        <div className="h-10 bg-gray-200 rounded w-24" />
        <div className="h-10 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}

/**
 * Full page loader with message
 */
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <SpinnerLoader size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline loader for buttons or small spaces
 */
export function InlineLoader() {
  return (
    <div className="inline-flex items-center">
      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
    </div>
  );
}

/**
 * Shimmer effect for images or content
 */
export function ShimmerEffect({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className="shimmer-wrapper">
        <div className="shimmer" />
      </div>
      <style jsx>{`
        .shimmer-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          animation: shimmer 2s infinite;
        }
        .shimmer {
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.5),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
