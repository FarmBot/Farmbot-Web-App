require "spec_helper"
require "rake"

Rake.application = Rake::Application.new
Rake::Task.define_task("assets:precompile")
Rake::Task.define_task("assets:clean")

load Rails.root.join("lib/tasks/api.rake").to_s

describe "api.rake helpers" do
  %w[NO_CLEAN FOREVER].each do |key|
    describe "#truthy_env? for #{key}" do
      it "accepts TRUE regardless of case or surrounding whitespace" do
        ["TRUE", "true", "TrUe", " TRUE "].each do |value|
          with_modified_env(key => value) do
            expect(truthy_env?(key)).to be(true)
          end
        end
      end

      it "rejects other values, including aliases, blank and unset" do
        ["FALSE", "false", "0", "1", "yes", "YES", "on", "ON",
         "y", "no", "off", "OFF", "", "  ", nil].each do |value|
          with_modified_env(key => value) do
            expect(truthy_env?(key)).to be(false)
          end
        end
      end
    end
  end
end
