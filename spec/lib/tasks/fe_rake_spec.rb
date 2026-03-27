require "spec_helper"
require "rake"

Rake.application = Rake::Application.new
Rake::Task.define_task("environment")

load Rails.root.join("lib/tasks/fe.rake").to_s

describe "fe.rake helpers" do
  describe "#parse_bun_outdated" do
    it "parses bun outdated table output" do
      output = <<~TEXT
        bun outdated v1.3.11 (af24e281)
        [0.07ms] ".env"
        ┌────────────────────────────────────────┬─────────┬─────────┬──────────┐
        │ Package                                │ Current │ Update  │ Latest   │
        ├────────────────────────────────────────┼─────────┼─────────┼──────────┤
        │ @blueprintjs/core                      │ 6.10.0  │ 6.10.0  │ 6.11.1   │
        ├────────────────────────────────────────┼─────────┼─────────┼──────────┤
        │ @happy-dom/global-registrator (dev)    │ 20.8.4  │ 20.8.4  │ 20.8.9   │
        └────────────────────────────────────────┴─────────┴─────────┴──────────┘
      TEXT

      expect(parse_bun_outdated(output)).to eq({
        "@blueprintjs/core" => "6.11.1",
        "@happy-dom/global-registrator" => "20.8.9",
      })
    end

    it "parses bun outdated colored key-value output" do
      output = <<~TEXT
        {"\\e[1m\\e[34mPackage\\e[0m" => "\\e[1m\\e[34mLatest\\e[0m", "@blueprintjs/core\\e[2m\\e[0m" => "\\e[2m6.\\e[0m\\e[1m\\e[33m11.1\\e[0m", "@happy-dom/global-registrator\\e[2m (dev)\\e[0m" => "\\e[2m20.8.\\e[0m\\e[1m\\e[32m9\\e[0m"}
      TEXT

      normalized_output = output
        .delete_prefix("{")
        .delete_suffix("}\n")
        .gsub('", "', "\"\n\"")
        .gsub(/\A"/, "")
        .gsub(/"\z/, "")
        .gsub('" => "', " => ")

      expect(parse_bun_outdated(normalized_output)).to eq({
        "@blueprintjs/core" => "6.11.1",
        "@happy-dom/global-registrator" => "20.8.9",
      })
    end
  end
end
