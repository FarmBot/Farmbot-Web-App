require 'spec_helper'

describe CeleryScript::Checker do
  file = File.read("./spec/lib/celery_script/ast_fixture3.json")

  let(:tree) do
      CeleryScript::AstNode.new(JSON.parse(file).deep_symbolize_keys)
  end

  let (:corpus) do
    steps = [ :var_set, :var_get, :move_absolute, :move_relative, :write_pin,
              :read_pin, :wait, :send_message, :execute, :if_statement]
    CeleryScript::Corpus
      .new
      .defineArg(:x,               [Fixnum])
      .defineArg(:y,               [Fixnum])
      .defineArg(:z,               [Fixnum])
      .defineArg(:speed,           [Fixnum])
      .defineArg(:pin_number,      [Fixnum])
      .defineArg(:pin_value,       [Fixnum])
      .defineArg(:pin_mode,        [Fixnum])
      .defineArg(:data_label,      [String])
      .defineArg(:data_value,      [String])
      .defineArg(:data_type,       [String])
      .defineArg(:milliseconds,    [Fixnum])
      .defineArg(:message,         [String])
      .defineArg(:sub_sequence_id, [Fixnum])
      .defineArg(:lhs,             [String])
      .defineArg(:op,              [String])
      .defineArg(:rhs,             [Fixnum])
      .defineNode(:var_set,        [:data_label, :data_type])
      .defineNode(:var_get,        [:data_label, :data_type, :data_value],)
      .defineNode(:move_absolute,  [:x, :y, :z, :speed],)
      .defineNode(:move_relative,  [:x, :y, :z, :speed],)
      .defineNode(:write_pin,      [:pin_number, :pin_value, :pin_mode ],)
      .defineNode(:read_pin,       [:pin_number, :data_label, :pin_mode])
      .defineNode(:wait,           [:milliseconds])
      .defineNode(:send_message,   [:message])
      .defineNode(:execute,        [:sub_sequence_id])
      .defineNode(:if_statement,   [:lhs, :op, :rhs, :sub_sequence_id])
      .defineNode(:sequence,       [], steps)
  end

  it "runs through a syntactically valid program" do
      checker = CeleryScript::Checker.new(tree, corpus)
      outcome = checker.run!
      expect(outcome).to be_kind_of(CeleryScript::AstNode)
      expect(outcome.comment).to eq("Properly formatted, syntactically valid sequence.")
  end
end