# Contributor Guide

## Style
Follow existing codebase conventions and style, for example:
- use `return <Component />` instead of return `(<Component />)`
- do not write lines longer than 85 characters
- use lodash `range(` instead of `Array.from({ length: ...`

## Testing Instructions
- Jest mocks already exist for many modules in `frontend/__test_support__`.
- New tests should be written using the `@testing-library/react` library.
- For frontend work:
   - first, make sure type checks pass: `npm run typecheck`
   - then make sure all linters pass: `npm run linters`
   - first, make sure the tests pass for the files you change:
      for example, `npm run test frontend/__tests__/file.tsx`
   - then make sure all tests pass: `npm run test-slow`
   - first, make sure test coverage for all code you change is at 100%:
      find the file in the `coverage_fe/` directory and make sure it's 100%
   - then make sure the test coverage for all code you change is at 100%:
      `rake coverage:run`
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, be sure linters still pass.
- Add or update tests for the code you change, even if nobody asked.

## These typical development checks are not yet supported in environments without docker:
- For frontend work:
   - make sure the build passes: `rake assets:precompile`
- For backend work:
   - first, make sure the tests pass for the files you change:
      for example, `rspec spec spec/file.rb`
   - then make sure all tests pass: `rspec spec`
   - ensure the test coverage for all code you change is at 100%:
      find the file in the `coverage_api/` directory and make sure it's 100%
