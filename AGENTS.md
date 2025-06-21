# Contributor Guide

## Setup
```
npm install
bundle install
```

## Style
Follow existing codebase conventions and style, for example:
- use `return <Component />` instead of return `(<Component />)`
- do not write lines longer than 85 characters
- use lodash `range(` instead of `Array.from({ length: ...`

## Testing Instructions
- Jest mocks already exist for many modules in `frontend/__test_support__`.
- New tests should be written using the `@testing-library/react` library.
- For frontend work:
   - Make sure all checks and linters pass (may take about a minute each):
      ```
      npm run typecheck
      npm run eslint
      npm run sass-lint
      npm run sass-check
      ```
   - Make sure the tests pass for the files you change.
      For example, `npm run test frontend/__tests__/file.tsx`.
   - Make sure all tests pass: `npm run test-slow`. This will take 10 minutes or so.
   - Make sure test coverage for all code you change is at 100%:
      Find the file in the `coverage_fe/` directory and make sure it's 100%.
      CLI examples:
       `cat coverage_fe/frontend/file.tsx.html | grep strong` should output 4x `100%`
       `cat coverage_fe/frontend/file.tsx.html | grep "not covered"` output should be empty
   - Make sure the test coverage for all code you change is at 100%: `rake coverage:run`
      It has passed if `Pass? yes` is present in the output.
      If `Pass? no` is present, you need to add tests to cover the code you changed.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, be sure linters still pass.
- Add or update tests for the code you change, even if nobody asked.
