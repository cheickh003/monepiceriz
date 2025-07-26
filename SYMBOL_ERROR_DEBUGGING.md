# Symbol Error Debugging Guide

## Overview

This guide helps debug and prevent "TypeError: Cannot convert a Symbol value to a string" errors that commonly occur with Radix UI components, particularly when using the `asChild` prop with the Slot component.

## Common Causes

1. **Radix UI Slot with Symbol Props**: The most common cause is passing Symbol values as props to components that use Radix UI's Slot component (via `asChild`)
2. **Server-Side Props**: Props coming from the server (Laravel/Inertia) may contain Symbol values
3. **React Key Props**: Using Symbol values as React keys
4. **String Interpolation**: Attempting to interpolate Symbol values in template literals

## Prevention Strategies

### 1. Use SafeButton Component

Replace all Button components with SafeButton in areas where Symbol errors occur:

```tsx
// Before
import { Button } from '@/Components/ui/button'

<Button asChild>
  <Link href="/path">Click me</Link>
</Button>

// After
import SafeButton from '@/Components/SafeButton'

<SafeButton asChild>
  <Link href="/path">Click me</Link>
</SafeButton>
```

### 2. Sanitize Server Props

Always sanitize props from server before using them:

```tsx
import { sanitizeForReact } from '@/lib/utils'

const MyComponent = ({ serverData }) => {
  const safeData = sanitizeForReact(serverData)
  // Use safeData instead of serverData
}
```

### 3. Use Symbol-Safe Hooks

For components that receive dynamic props:

```tsx
import { useSymbolSafeProps } from '@/hooks/useSymbolSafeProps'

const MyComponent = (props) => {
  const safeProps = useSymbolSafeProps(props)
  return <div {...safeProps} />
}
```

## Debugging Steps

### 1. Enable Development Warnings

Run the app with Symbol debugging enabled:

```bash
npm run debug:symbols
```

### 2. Check for Symbol Usage

Run the Symbol check script:

```bash
npm run check:symbols
```

### 3. Review Console Warnings

Look for warnings in the browser console:
- "SafeButton: Props contained Symbol values"
- "Found Symbol value in React props"
- Symbol error stack traces

### 4. Use React DevTools

1. Open React DevTools
2. Search for components with Symbol warnings
3. Inspect props for Symbol values (shown as `Symbol(...)`)

## Error Patterns

### Pattern 1: Button with asChild

**Error**: 
```
TypeError: Cannot convert a Symbol value to a string
  at Slot component
```

**Solution**: Use SafeButton or validate props before passing to Button

### Pattern 2: Dynamic Keys

**Error**:
```
Warning: Encountered two children with the same key, `Symbol(...)`
```

**Solution**: Convert Symbol to string for React keys:
```tsx
key={String(item.id)}
```

### Pattern 3: Template Literals

**Error**:
```
TypeError: Cannot convert a Symbol value to a string
  at template literal
```

**Solution**: Use safeStringify utility:
```tsx
import { safeStringify } from '@/lib/utils'
const message = `Item: ${safeStringify(value)}`
```

## Component Checklist

When creating new components that might receive Symbol values:

- [ ] Import and use sanitizeForReact for server props
- [ ] Use SafeButton instead of Button when using asChild
- [ ] Validate props with validateReactProps before rendering
- [ ] Use String() for React keys
- [ ] Test with Symbol values in development

## Testing for Symbol Errors

Add this test to your component tests:

```tsx
it('handles Symbol props without crashing', () => {
  const symbolProp = { id: Symbol('test') }
  const { container } = render(<MyComponent {...symbolProp} />)
  expect(container).toBeInTheDocument()
})
```

## Production Safeguards

1. **Global Error Boundary**: Catches and recovers from Symbol errors
2. **Prop Sanitization**: Automatically cleans Symbol values
3. **Fallback Rendering**: SafeButton falls back to native button if needed
4. **Error Logging**: Symbol errors are logged with context

## When to Use Each Solution

- **SafeButton**: Always when using Button with asChild
- **sanitizeForReact**: For all server-provided props
- **useSymbolSafeProps**: For components accepting arbitrary props
- **validateReactProps**: For conditional rendering based on prop validity
- **ErrorBoundary**: Wrap major sections to catch runtime errors

## Additional Resources

- [Radix UI Slot Documentation](https://www.radix-ui.com/primitives/docs/utilities/slot)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [MDN Symbol Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)