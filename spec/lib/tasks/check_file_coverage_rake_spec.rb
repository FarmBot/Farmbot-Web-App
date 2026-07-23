require "spec_helper"
require "rake"
require "tempfile"

Rake.application = Rake::Application.new

load Rails.root.join("lib/tasks/check_file_coverage.rake").to_s

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
