import React, { ReactNode } from 'react';
import { cn } from '@/lib/design-tokens';

interface PageCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'minimal';
  padding?: boolean;
}

/**
 * StandardPageCard Component
 * Wraps page content with consistent styling
 */
export const PageCard: React.FC<PageCardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = true,
}) => {
  const variantClass = 
    variant === 'default' ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md' :
    variant === 'elevated' ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-lg' :
    'border-slate-200 dark:border-slate-800 bg-transparent';

  const baseStyles = cn(
    'rounded-lg border transition-shadow duration-300',
    variantClass
  );

  const paddingClass = padding ? 'p-6' : '';

  return (
    <div className={cn(baseStyles, paddingClass, className)}>
      {children}
    </div>
  );
};

/**
 * PageHeader Component
 * Standardized page title + optional filters/actions
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  filters,
  actions,
  breadcrumb,
}) => {
  return (
    <div className="space-y-4">
      {breadcrumb && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {breadcrumb}
        </div>
      )}
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-9 text-slate-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>

      {filters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters}
        </div>
      )}
    </div>
  );
};

/**
 * EmptyState Component
 * Shown when no data is available
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  image?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  image,
}) => {
  return (
    <PageCard variant="minimal" padding className="flex flex-col items-center justify-center py-12 text-center">
      {image ? (
        <div className="mb-4 h-48 w-48 flex-shrink-0">
          {/* Image could be rendered here */}
        </div>
      ) : icon ? (
        <div className="mb-4 text-slate-300 dark:text-slate-600">
          {icon}
        </div>
      ) : null}
      
      <h3 className="text-lg font-semibold leading-7 text-slate-900 dark:text-white">
        {title}
      </h3>
      
      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400 max-w-md">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </PageCard>
  );
};

/**
 * SkeletonLoader Component
 * Loading placeholder for data-fetching components
 */
interface SkeletonLoaderProps {
  rows?: number;
  variant?: 'text' | 'card' | 'table' | 'list';
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  rows = 1,
  variant = 'text',
  className = '',
}) => {
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <PageCard className={className}>
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </PageCard>
    );
  }

  if (variant === 'table') {
    return (
      <PageCard className={className}>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 items-center"
            >
              <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </PageCard>
    );
  }

  // Default list variant
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <PageCard key={i} padding className="flex gap-4 items-center">
          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse" />
          </div>
        </PageCard>
      ))}
    </div>
  );
};
