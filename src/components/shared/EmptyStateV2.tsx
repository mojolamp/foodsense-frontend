import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isFeatureEnabled } from '@/lib/featureFlags'
import EmptyState from './EmptyState'
import { cn } from '@/lib/utils'

export interface EmptyStateV2Props {
  // Visual
  icon?: LucideIcon
  iconClassName?: string
  iconBackgroundColor?: 'blue' | 'gray' | 'purple' | 'green' | 'orange' | 'red' | 'indigo'

  // Content
  title: string
  description?: string
  helpText?: string | React.ReactNode

  // Actions
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }

  // Styling
  variant?: 'default' | 'compact' | 'hero'
  className?: string
}

export default function EmptyStateV2({
  icon: Icon,
  iconClassName,
  iconBackgroundColor = 'blue',
  title,
  description,
  helpText,
  primaryAction,
  secondaryAction,
  variant = 'default',
  className,
}: EmptyStateV2Props) {
  // Feature flag check - fall back to V1 if flag is disabled
  if (!isFeatureEnabled('empty_states_v2')) {
    return (
      <EmptyState
        icon={Icon}
        title={title}
        description={description}
        action={
          primaryAction ? (
            <Button onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          ) : undefined
        }
      />
    )
  }

  // Icon background color mapping
  const iconBackgroundColors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    gray: 'bg-gray-100 dark:bg-gray-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30',
  }

  const iconTextColors = {
    blue: 'text-blue-600 dark:text-blue-400',
    gray: 'text-gray-600 dark:text-gray-400',
    purple: 'text-purple-600 dark:text-purple-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  }

  // Variant-specific styles
  const variantStyles = {
    default: {
      container: 'py-12 px-4',
      iconSize: 'h-12 w-12',
      iconCircle: 'p-4',
      titleSize: 'text-xl',
      descriptionSize: 'text-base',
    },
    compact: {
      container: 'py-8 px-4',
      iconSize: 'h-8 w-8',
      iconCircle: 'p-3',
      titleSize: 'text-lg',
      descriptionSize: 'text-sm',
    },
    hero: {
      container: 'py-16 px-4',
      iconSize: 'h-16 w-16',
      iconCircle: 'p-6',
      titleSize: 'text-2xl',
      descriptionSize: 'text-lg',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        styles.container,
        className
      )}
    >
      {/* Icon */}
      {Icon && (
        <div
          className={cn(
            'rounded-full mb-6',
            styles.iconCircle,
            iconBackgroundColors[iconBackgroundColor]
          )}
        >
          <Icon
            className={cn(
              styles.iconSize,
              iconTextColors[iconBackgroundColor],
              iconClassName
            )}
          />
        </div>
      )}

      {/* Title */}
      <h3
        className={cn(
          'font-semibold text-foreground mb-2 text-center',
          styles.titleSize
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            'text-muted-foreground max-w-md text-center mb-4',
            styles.descriptionSize
          )}
        >
          {description}
        </p>
      )}

      {/* Help Text */}
      {helpText && (
        <div className="bg-muted/50 rounded-lg p-4 max-w-lg mb-6">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {helpText}
          </p>
        </div>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="min-w-[140px]"
              size={variant === 'compact' ? 'sm' : 'default'}
            >
              {primaryAction.icon && (
                <primaryAction.icon className="mr-2 h-4 w-4" />
              )}
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className="min-w-[140px]"
              size={variant === 'compact' ? 'sm' : 'default'}
            >
              {secondaryAction.icon && (
                <secondaryAction.icon className="mr-2 h-4 w-4" />
              )}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
