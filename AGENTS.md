# Contributor Guide

## Setup
```
npm install
bundle install
```

## Style
Follow existing codebase conventions and style, for example:
- use `return <Component />` instead of `return (<Component />)`
- do not write lines longer than 85 characters
- use lodash `range(` instead of `Array.from({ length: ...`

## Testing Instructions
- When changing the code of a function, make sure the change is compatible with
   existing uses of the function.
- Jest mocks already exist for many modules in `frontend/__test_support__`.
- New tests should be written using the `@testing-library/react` library.
- For frontend work (changes to files in the `frontend/` directory):
   - Make sure all checks and linters pass:
      ```
      npm run typecheck
      npm run eslint
      npm run sass-lint
      npm run sass-check
      ```
   - Make sure the tests pass for the files you change.
      For example, `npm run test frontend/__tests__/file.tsx`.
   - Make sure all tests pass: `npm run test-slow`.
   - Ensure the test coverage for all code you change is at 100%:
      For example, `bundle exec rake check_file_coverage:fe frontend/file.tsx`.
      Alternatively:
        `changed=$(git diff --name-only staging...HEAD | tr '\n' ',' | sed 's/,$//')`
        `CHANGED_FILES=$changed bundle exec rake check_file_coverage:fe`
   - Make sure the test coverage for all code you change is at 100%: `rake coverage:run`
      It has passed if `Pass? yes` is present in the output.
      If `Pass? no` is present, you need to add tests to cover the code you changed.
   - Make sure the build passes: `bundle exec rake assets:precompile`.
- For backend work (changes to files in `app` or `spec` directories):
   - Make sure the tests pass for the files you change.
      For example, `bundle exec rspec spec spec/file.rb`.
   - Make sure all tests pass: `bundle exec rspec spec`.
   - Ensure the test coverage for all code you change is at 100%:
      For example, `bundle exec rake check_file_coverage:api app/file.rb`.
   - Ensure test coverage is at 100%: `bundle exec rake check_file_coverage:api`.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, be sure linters still pass.
- Add or update tests for the code you change, even if nobody asked.
