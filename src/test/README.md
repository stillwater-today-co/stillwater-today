# Authentication Tests

This directory contains unit tests for the authentication system.

## Running Tests

```bash
# Install dependencies (if not already done)
npm install

# Run tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui
```

## Test Coverage

### ✅ What's Tested:

1. **Auth Utils** (`src/utils/__tests__/auth.test.ts`)
   - Sign in success/failure
   - Sign up success/failure  
   - Sign out success/failure
   - Password reset success/failure
   - User data formatting

2. **useAuth Hook** (`src/hooks/__tests__/useAuth.test.tsx`)
   - Loading state initialization
   - User sign in state changes
   - User sign out state changes
   - Error handling
   - Cleanup on unmount

3. **ProtectedRoute** (`src/components/__tests__/ProtectedRoute.test.tsx`)
   - Loading state display
   - Authenticated user access
   - Guest user access
   - Fallback rendering
   - Different requireAuth scenarios

4. **LoginForm** (`src/components/auth/__tests__/LoginForm.test.tsx`)
   - Form rendering
   - Successful login flow
   - Error handling
   - Loading states
   - Navigation callbacks
   - Form validation

### 🎯 Test Benefits:

- **Catch regressions** when making changes
- **Document expected behavior** 
- **Ensure security** of auth flows
- **Verify user experience** works correctly
- **Speed up development** with confidence

### 📝 Adding More Tests:

To add tests for other components:
1. Create `__tests__` folder next to component
2. Import testing utilities and component
3. Mock dependencies (Firebase, context, etc.)
4. Test different scenarios (success, error, loading)

Example test structure:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```
