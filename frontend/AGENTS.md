# Frontend Contributor Guide
For changes to files in the `frontend/` directory.

## Style
Follow existing codebase conventions and style, for example:
- use `return <Component />` instead of `return (<Component />)`
- do not write lines longer than 85 characters
- use lodash `range(` instead of `Array.from({ length: ...`

## Testing Instructions
- Jest mocks already exist for many modules in `frontend/__test_support__`.
- New tests should be written using the `@testing-library/react` library.
- Do not terminate test commands before they are completed.

### For the files you change
- Make sure all checks and linters pass:
   ```
   npm run typecheck
   npm run eslint
   npm run sass-lint
   npm run sass-check
   ```
- Run tests via `npm run test-slow FILES`
   where `FILES` is a space-separated list of test files for the frontend files you changed.
   For example, `npm run test-slow frontend/__tests__/file_0_test.tsx frontend/__tests__/file_1_test.tsx`.
   Check the output to verify all tests pass.
- Run `rake check_file_coverage:fe FILES`
   where `FILES` is a space-separated list of frontend files you changed.
   For example, `rake check_file_coverage:fe frontend/file_0.tsx frontend/file_1.tsx`.
   Check the output to verify test coverage for all files is at 100%.

### Before committing
- Run tests via `npm run test-slow`.
   Check the output to verify all tests pass.
- Run `rake coverage:run`.
   Check the output:
   It has passed if `Pass? yes` is present in the output.
   If `Pass? no` is present, you need to add tests to cover the code you changed.
- Run `rake assets:precompile`.
   Check the output to verify the build passes.

## Other guides
Also follow the [Project Contributor Guide](../AGENTS.md).
