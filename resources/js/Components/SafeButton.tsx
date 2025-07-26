import React from 'react'
import { Button, ButtonProps } from '@/Components/ui/button'
import { validateReactProps, sanitizeForReact } from '@/lib/utils'

/**
 * SafeButton - A wrapper around the Button component that validates and sanitizes props
 * to prevent Symbol conversion errors when using Radix UI's Slot component
 */
export interface SafeButtonProps extends ButtonProps {
  // Additional safety props
  fallbackOnError?: boolean
}

const SafeButton = React.forwardRef<HTMLButtonElement, SafeButtonProps>(
  ({ children, fallbackOnError = true, ...props }, ref) => {
    // Validate props before passing to Button
    const hasValidProps = validateReactProps(props)
    
    // Sanitize props to remove any Symbol values
    const sanitizedProps = sanitizeForReact(props)
    
    // Log warnings in development
    if (!hasValidProps && process.env.NODE_ENV === 'development') {
      console.warn('SafeButton: Props contained Symbol values and were sanitized', {
        originalProps: props,
        sanitizedProps
      })
    }
    
    // Special handling for asChild prop
    if (sanitizedProps.asChild) {
      // Validate children when asChild is true
      if (!React.isValidElement(children)) {
        if (process.env.NODE_ENV === 'development') {
          console.error('SafeButton: asChild is true but children is not a valid React element')
        }
        
        if (fallbackOnError) {
          // Force fallback to regular button
          sanitizedProps.asChild = false
        }
      } else {
        // Check children props for Symbols
        const childElement = children as React.ReactElement
        if (childElement.props && !validateReactProps(childElement.props)) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('SafeButton: Child element props contain Symbol values')
          }
          
          if (fallbackOnError) {
            // Clone child with sanitized props
            const sanitizedChild = React.cloneElement(
              childElement,
              sanitizeForReact(childElement.props)
            )
            
            return (
              <Button ref={ref} {...sanitizedProps}>
                {sanitizedChild}
              </Button>
            )
          }
        }
      }
    }
    
    try {
      return (
        <Button ref={ref} {...sanitizedProps}>
          {children}
        </Button>
      )
    } catch (error) {
      // Catch any runtime errors and provide fallback
      if (process.env.NODE_ENV === 'development') {
        console.error('SafeButton: Error rendering Button component', error)
      }
      
      if (fallbackOnError) {
        // Render a plain button as fallback
        const { asChild, variant, size, className, ...htmlProps } = sanitizedProps
        
        return (
          <button
            ref={ref}
            className={className as string}
            {...htmlProps}
          >
            {children}
          </button>
        )
      }
      
      // Re-throw if not using fallback
      throw error
    }
  }
)

SafeButton.displayName = 'SafeButton'

export { SafeButton }
export default SafeButton