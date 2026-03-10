require "spec_helper"
require "rake"

Rake.application = Rake::Application.new
Rake::Task.define_task("assets:precompile")
Rake::Task.define_task("assets:clean")

load Rails.root.join("lib/tasks/api.rake").to_s

describe "api.rake helpers" do
  describe "#truthy_env?" do
    it "treats true-like values as true" do
      with_modified_env("NO_CLEAN" => "true") do
        expect(truthy_env?("NO_CLEAN")).to be(true)
      end

      with_modified_env("NO_CLEAN" => "1") do
        expect(truthy_env?("NO_CLEAN")).to be(true)
      end

      with_modified_env("NO_CLEAN" => "yes") do
        expect(truthy_env?("NO_CLEAN")).to be(true)
      end
    end

    it "treats false-like values as false" do
      with_modified_env("NO_CLEAN" => "false") do
        expect(truthy_env?("NO_CLEAN")).to be(false)
      end

      with_modified_env("NO_CLEAN" => "0") do
        expect(truthy_env?("NO_CLEAN")).to be(false)
      end

      with_modified_env("NO_CLEAN" => nil) do
        expect(truthy_env?("NO_CLEAN")).to be(false)
      end
    end
  end
end
