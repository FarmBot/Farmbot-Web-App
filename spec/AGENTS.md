# Backend Contributor Guide
For changes to files in the `app/` or `spec/` directories.

## Testing Instructions
- Do not terminate test commands before they are completed.

### For the files you change
- Run tests via `rspec FILES`
   where `FILES` is a space-separated list of spec files for the app files you changed.
   For example, `rspec spec/file_0_spec.rb spec/file_1_spec.rb`.
   Check the output to verify all tests pass.
- Run `rake check_file_coverage:api FILES`
   where `FILES` is a space-separated list of app files you changed.
   For example, `rake check_file_coverage:api app/file_0.rb app/file_1.rb`.
   Check the output to verify test coverage for all files is at 100%.

### Before committing
- Run tests via `rspec spec`.
   Check the output to verify all tests pass.
- Run `rake check_file_coverage:api`.
   Check the output to verify test coverage is at 100%.

## Other guides
Also follow the [Project Contributor Guide](../AGENTS.md).
