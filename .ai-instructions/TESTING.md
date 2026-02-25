# TESTING.md: Testing Guardrails

This document defines the requirements and standards for testing within the Vitaflix repository. Comprehensive testing is required to ensure the reliability of the "Nutritional Engine."

## 1. Test Categories
- **Unit Tests**: Required for all shared utility libraries, macro calculations, and Zod schema logic.
- **Integration Tests**: Required for API routes (Next.js) and critical Supabase Edge Functions. Must test interaction with the database.
- **End-to-End (E2E) Tests**: Required for critical paths: Onboarding, Subscription Checkout, and Meal Plan generation.

## 2. Mocking Rules
- **External Services**: All calls to Stripe, PayPal, or third-party APIs must be mocked in Unit and Integration tests.
- **Database**: Use a dedicated staging/test database for integration tests. Never run tests against production data.
- **Consistent State**: Use factory patterns or global fixtures to ensure tests start from a predictable state.

## 3. Standards & Naming
- **File Naming**: Tests must be co-located with the source file using the `.test.ts` or `.spec.ts` suffix.
- **Test Structure**: Use the **Arrange-Act-Assert (AAA)** pattern for all test cases.
- **Description**: Test names must be descriptive and follow the "should..." pattern (e.g., "should calculate total protein correctly from ingredients").

## 4. Coverage Expectations
- **Critical Logic**: 100% coverage for macro calculations and caloric variation logic.
- **API Handlers**: Must test both "Happy Path" and "Error Path" (e.g., 400 Bad Request on invalid Zod validation).
- **UI Components**: Focus on testing behavior (events, conditional rendering) rather than implementation details.
