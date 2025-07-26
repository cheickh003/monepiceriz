import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-green-600 text-white hover:bg-green-700",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// Helper function to validate props for Symbol values
function validateButtonProps(props: any): boolean {
  if (!props) return true
  
  for (const key in props) {
    const value = props[key]
    if (typeof value === 'symbol') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Button component received Symbol value for prop "${key}"`, value)
      }
      return false
    }
  }
  
  return true
}

// Helper function to sanitize props
function sanitizeProps(props: any): any {
  if (!props) return props
  
  const sanitized: any = {}
  
  for (const key in props) {
    const value = props[key]
    if (typeof value === 'symbol') {
      // Convert Symbol to string representation
      sanitized[key] = value.toString()
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    // Validate and sanitize props to prevent Symbol conversion errors
    const isValidProps = validateButtonProps(props)
    const sanitizedProps = sanitizeProps(props)
    
    // If asChild is true, validate that children is a valid React element
    if (asChild && children) {
      if (!React.isValidElement(children)) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Button: asChild is true but children is not a valid React element')
        }
        // Fallback to regular button
        asChild = false
      }
    }
    
    try {
      const Comp = asChild ? Slot : "button"
      
      // Additional safety check for Slot component
      if (asChild) {
        // Ensure children can safely receive props
        if (React.isValidElement(children)) {
          const childProps = (children as any).props || {}
          if (!validateButtonProps(childProps)) {
            // Fallback to regular button if child props contain Symbols
            const FallbackComp = "button"
            return (
              <FallbackComp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...sanitizedProps}
              >
                {children}
              </FallbackComp>
            )
          }
        }
      }
      
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...sanitizedProps}
        >
          {children}
        </Comp>
      )
    } catch (error) {
      // Fallback rendering if Slot component fails
      if (process.env.NODE_ENV === 'development') {
        console.error('Button component error:', error)
      }
      
      return (
        <button
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...sanitizedProps}
        >
          {children}
        </button>
      )
    }
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }