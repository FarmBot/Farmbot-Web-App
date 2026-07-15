require "spec_helper"
require "rake"

Rake.application = Rake::Application.new

load Rails.root.join("lib/tasks/coverage.rake").to_s

describe "coverage.rake helpers" do
  describe "#frontend_source_file?" do
    it "includes frontend source files" do
      expect(frontend_source_file?("frontend/example.ts")).to be(true)
      expect(frontend_source_file?("frontend/example.tsx")).to be(true)
      expect(frontend_source_file?("frontend/example.js")).to be(true)
      expect(frontend_source_file?("frontend/example.jsx")).to be(true)
    end

    it "excludes binary and non-source files" do
      expect(frontend_source_file?("frontend/example.bin")).to be(false)
      expect(frontend_source_file?("frontend/example.scss")).to be(false)
      expect(frontend_source_file?("frontend/example.json")).to be(false)
    end
  end
end
