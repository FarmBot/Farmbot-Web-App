require 'spec_helper'

describe CeleryScript::Checker do
  file_path = File.read("/home/rick/code/farmbot/api/spec/mutations/sequences/improved_ast_fixture.json")

  let(:tree) do
      CeleryScript::AstNode.new(JSON.parse(file_path).deep_symbolize_keys)
  end

  let (:corpus) do
    CeleryScript::Corpus
        .new
        .defineArg(:data_label, [String])
        .defineArg(:data_type,  [String])
        .defineArg(:data_value, [Fixnum, :var_get])
        .defineArg(:x,          [:blah]) do |param, problem|
            problem("Param can't be -1") if param < 0
        end
        .defineNode(:sequence, [:x],    [:other, :whatever])
        .defineNode(:blah,     [:data_value, :data_type])
        .defineNode(:var_get,  [:data_label])
        .defineNode(:whatever, [:data_type, :data_value])
        .defineNode(:var_get,  [:data_label])
        .defineNode(:other,    [:data_type, :data_value])
  end

  it "runs" do
    begin
      checker = CeleryScript::Checker.new(tree, corpus)
      outcome = checker.run!
    rescue CeleryScript::TypeCheckError => e
      binding.pry
    end
  end
end