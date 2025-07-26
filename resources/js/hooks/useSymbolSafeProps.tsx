import { useMemo } from 'react'
import { validateReactProps, sanitizeForReact } from '@/lib/utils'

/**
 * Hook to validate and sanitize props for Symbol values
 * Useful when working with Radix UI components that use Slot
 * 
 * @param props - The props object to validate and sanitize
 * @returns Sanitized props safe for React rendering
 */
export function useSymbolSafeProps<T extends Record<string, any>>(props: T): T {
  return useMemo(() => {
    // First validate the props
    const hasValidProps = validateReactProps(props)
    
    if (!hasValidProps) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          'useSymbolSafeProps: Props contained Symbol values and were sanitized',
          { originalProps: props }
        )
      }
    }
    
    // Always return sanitized props
    return sanitizeForReact(props)
  }, [props])
}

/**
 * Hook to validate children for Symbol values
 * Useful when components accept arbitrary children
 * 
 * @param children - React children to validate
 * @returns Boolean indicating if children are safe
 */
export function useSymbolSafeChildren(children: React.ReactNode): boolean {
  return useMemo(() => {
    if (!children) return true
    
    // Check if children is a React element
    if (typeof children === 'object' && 'props' in children) {
      return validateReactProps((children as any).props)
    }
    
    // Check if children is an array
    if (Array.isArray(children)) {
      return children.every(child => {
        if (typeof child === 'object' && child && 'props' in child) {
          return validateReactProps((child as any).props)
        }
        return true
      })
    }
    
    // Primitive children are always safe
    return true
  }, [children])
}

/**
 * Higher-order component to wrap components with Symbol validation
 * 
 * @param Component - Component to wrap
 * @param displayName - Optional display name for debugging
 * @returns Wrapped component with Symbol validation
 */
export function withSymbolSafeProps<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  displayName?: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const safeProps = useSymbolSafeProps(props)
    return <Component {...safeProps} />
  }
  
  WrappedComponent.displayName = displayName || `withSymbolSafeProps(${Component.displayName || Component.name})`
  
  return WrappedComponent
}