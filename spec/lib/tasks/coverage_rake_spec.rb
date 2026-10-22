require "spec_helper"
require "rake"

Rake.application = Rake::Application.new

load Rails.root.join("lib/tasks/coverage.rake").to_s

describe "coverage.rake helpers" do
  describe "#coverage_baseline" do
    let(:csv) { { branch: "staging", commit: "csv-sha", percent: 99.9 } }
    let(:coveralls) do
      { branch: "staging", commit: "coveralls-sha", percent: 99.8 }
    end
    let(:unavailable) { { branch: "staging", commit: nil, percent: nil } }
    let(:history) { [coveralls] }

    before do
      stub_const("REMOTE_COVERAGE_OVERRIDE", 0)
      allow(self).to receive(:puts)
      allow(self).to receive(:fetch_build_data).and_return(history)
      allow(self).to receive(:latest_csv_coverage).with("staging")
        .and_return(csv)
      allow(self).to receive(:fetch_latest_branch_build).with("staging")
        .and_return(unavailable)
      allow(self).to receive(:fetch_latest_pr_base_branch_build).with("staging")
        .and_return(unavailable)
    end

    it "uses Coveralls first by default" do
      expect(self).not_to receive(:latest_csv_coverage)

      expect(coverage_baseline("staging")).to eq(coveralls)
    end

    it "skips Coveralls requests when the preferred CSV is available" do
      expect(self).not_to receive(:fetch_build_data)
      expect(self).not_to receive(:fetch_latest_branch_build)
      expect(self).not_to receive(:fetch_latest_pr_base_branch_build)

      expect(coverage_baseline("staging", prefer_csv: true)).to eq(csv)
    end

    it "accepts zero percent as a valid CSV baseline" do
      csv[:percent] = 0
      expect(self).not_to receive(:fetch_build_data)

      expect(coverage_baseline("staging", prefer_csv: true)).to eq(csv)
    end

    context "when CSV is unavailable" do
      let(:csv) { unavailable }

      it "falls back to Coveralls when CSV is preferred" do
        expect(self).to receive(:latest_csv_coverage).with("staging").once
          .ordered.and_return(unavailable)
        expect(self).to receive(:fetch_build_data).ordered.and_return(history)

        expect(coverage_baseline("staging", prefer_csv: true)).to eq(coveralls)
      end

      context "when Coveralls is also unavailable" do
        let(:history) { [] }

        it "does not fetch CSV a second time" do
          expect(self).to receive(:latest_csv_coverage).with("staging").once
            .and_return(unavailable)

          expect(coverage_baseline("staging", prefer_csv: true))
            .to eq(branch: "N/A", commit: "", percent: 100)
        end
      end
    end

    context "when Coveralls is unavailable" do
      let(:history) { [] }

      it "retains CSV as the default fallback" do
        expect(coverage_baseline("staging")).to eq(csv)
      end

      it "retains the explicit coverage override" do
        stub_const("REMOTE_COVERAGE_OVERRIDE", 99.7)
        expect(self).not_to receive(:latest_csv_coverage)

        expect(coverage_baseline("staging"))
          .to eq(branch: "N/A", commit: "", percent: 99.7)
      end
    end
  end

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
