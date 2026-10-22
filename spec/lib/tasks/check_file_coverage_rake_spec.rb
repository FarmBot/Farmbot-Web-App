require "spec_helper"
require "rake"
require "tempfile"
require "stringio"

Rake.application = Rake::Application.new

load Rails.root.join("lib/tasks/check_file_coverage.rake").to_s

frontend_coverage_action = Rake::Task["check_file_coverage:fe"].actions.first

describe "check_file_coverage.rake helpers" do
  describe "#load_api_coverage" do
    it "loads per-file coverage from SimpleCov's JSON report" do
      report = {
        "coverage" => {
          "app/models/device.rb" => {
            "lines_covered_percent" => 100.0,
          },
        },
      }

      Tempfile.create do |file|
        file.write(JSON.generate(report))
        file.close

        expect(load_api_coverage(file.path)).to eq(report.fetch("coverage"))
      end
    end
  end
end

describe "check_file_coverage:fe scope reporting" do
  let(:report) do
    {
      "frontend/example.ts" => {
        lines: { covered: 1, total: 1 },
        branches: { covered: 1, total: 1 },
        functions: { covered: 1, total: 1 },
      },
      "frontend/interfaces.ts" => {},
    }
  end
  let(:environment) { {} }
  let(:paths) { [] }
  let(:output) { StringIO.new }
  let(:task) do
    Rake::Task.new("check_file_coverage:fe", Rake.application)
      .enhance(&frontend_coverage_action)
  end

  before do
    stub_const("ENV", environment)
    stub_const("ARGV", ["check_file_coverage:fe", *paths])
    allow(Rake.application).to receive(:top_level_tasks)
      .and_return(["check_file_coverage:fe"])
    allow_any_instance_of(Object).to receive(:load_lcov_coverage).and_return(report)
  end

  around do |example|
    original_stdout = $stdout
    $stdout = output
    example.run
  ensure
    $stdout = original_stdout
  end

  it "prints the checked-file count and LCOV scope before the result" do
    task.execute

    expect(output.string).to end_with("\n1 files checked from LCOV\nAll checked files at 100%! (PASS)\n")
  end

  context "with explicit file arguments" do
    let(:paths) { ["frontend/example.ts"] }

    it "identifies explicit paths" do
      task.execute

      expect(output.string).to end_with("\n1 explicitly selected files checked\n")
    end

    it "prioritizes explicit paths over changed files" do
      environment["CHANGED_FILES"] = "frontend/interfaces.ts"
      task.execute

      expect(output.string).to include("✅ frontend/example.ts: 100% coverage on all metrics")
      expect(output.string).to end_with("\n1 explicitly selected files checked\n")
    end

    it "uses explicit paths when the changed-file list is empty" do
      environment["CHANGED_FILES"] = ""
      task.execute

      expect(output.string).to end_with("\n1 explicitly selected files checked\n")
    end

    context "with a file missing from LCOV" do
      let(:paths) { ["frontend/example.ts", "frontend/missing.ts"] }
      let(:environment) { { "CHANGED_FILES" => "frontend/example.ts" } }

      it "checks every explicit path" do
        expect { task.execute }.to raise_error(SystemExit) { |error| expect(error.status).to eq(1) }
        expect(output.string).to include("❌ frontend/missing.ts: Coverage file not found in LCOV report.")
        expect(output.string).to end_with("\n2 explicitly selected files checked\nOne or more files did not meet coverage requirements. (FAIL)\n")
      end
    end
  end

  context "with changed files" do
    let(:environment) { { "CHANGED_FILES" => "frontend/example.ts" } }

    it "prints the changed-file count and branch before the result" do
      task.execute

      expect(output.string).to end_with("\n1 files changed since origin/staging\nAll changed files at 100%! (PASS)\n")
    end

    it "prints the scope before the failure result" do
      report["frontend/example.ts"][:functions][:covered] = 0

      expect { task.execute }.to raise_error(SystemExit) { |error| expect(error.status).to eq(1) }
      expect(output.string).to end_with("\n1 files changed since origin/staging\nOne or more files did not meet coverage requirements. (FAIL)\n")
    end

    it "reports zero checked files when no changed paths match LCOV" do
      environment["CHANGED_FILES"] = "frontend/missing.ts"
      task.execute

      expect(output.string).to include("skipped (not in frontend coverage report)")
      expect(output.string).to end_with("\n0 files changed since origin/staging\nAll changed files at 100%! (PASS)\n")
    end
  end

  context "with an empty changed-file list" do
    let(:environment) { { "CHANGED_FILES" => "" } }

    it "explains the fallback to all LCOV entries" do
      task.execute

      expect(output.string).to end_with("\n1 files checked from LCOV (no changed files)\nAll checked files at 100%! (PASS)\n")
    end

    it "distinguishes an unavailable merge base" do
      environment["CHANGED_FILES_BASE"] = ""
      task.execute

      expect(output.string).to end_with("\n1 files checked from LCOV (origin/staging merge base unavailable)\nAll checked files at 100%! (PASS)\n")
    end
  end
end
