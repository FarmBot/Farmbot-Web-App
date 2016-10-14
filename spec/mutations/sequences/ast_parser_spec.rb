require 'spec_helper'

describe Sequences::AstParser do
  let(:nodes) do
    JSON.parse(File.read("./spec/lib/celery_script/ast_fixture1.json"))
  end

  it 'validates the type of all key/value pairs in the AST' do
    result = Sequences::AstParser.run!(body: nodes)
    expect(result.length).to eq(nodes.length)
    nodes.each_with_index do |node, index|
      expect(result[index][:kind]).to eq(node["kind"])
    end
  end

  it 'strips out useless args' do
    nodes[0]["foo"] = "bar"
    results = Sequences::AstParser.run!(body: nodes)
    expect(results.map { |i| i["foo"] }.uniq!.first).to eq(nil)
  end

  it 'allows comments' do
    msg = "Just like a real programming language"
    nodes[0]["comment"] = msg
    results = Sequences::AstParser.run!(body: nodes)
    expect(results[0]["comment"]).to eq(msg)
  end

  it 'explains invalid args' do
    nodes[3]["args"]["pin_number"] = {}
    results = Sequences::AstParser.run(body: nodes)
    expect(results.success?).to eq(false)
    expect(results.errors.length).to eq(1)
    actual = results.errors["bad_args"].message
    expected = "Expected 'pin_number' in step 4 to Fixnum but ActiveSupport::HashWithIndifferentAccess"
    expect(actual).to eq(expected)
  end

  it 'ensures that mode is 0 or 1' do
    nodes[2]["args"]["pin_mode"] = 6 # Not valid.
    results = Sequences::AstParser.run(body: nodes)
    expect(results.success?).to eq(false)
    expect(results.errors.length).to eq(1)
    actual = results.errors["bad_args"].message
    expected = "Expected 'pin_mode' in step 3 to be 0 or 1 but got 6 (Fixnum)"
    expect(actual).to eq(expected)
  end

  it 'validates lhs' do
    nodes.last["args"]["lhs"] = "foo"
    results = Sequences::AstParser.run(body: nodes)
    expected = "Expected 'lhs' (left hand side) in step 8 to one of: "
    expect(results.errors["bad_args"].message).to include(expected)
  end

  it 'validates op' do
    nodes.last["args"]["op"] = "/"
    results = Sequences::AstParser.run(body: nodes)
    expected = "Expected 'op' (operand) in step 8 to be"
    expect(results.errors["bad_args"].message).to include(expected)
  end

  it 'validates data_type' do
    example = {
      body: [
        { kind: "var_set",
          args: { data_type: "object",
                  data_value: "1",
                  data_label: "incorrect" }
        }
      ]
    }
    results = Sequences::AstParser.run(example)
    expect(results.success?).to eq(false)
    expected = "Expected 'data_type' in step 1 to be one of: string, integer, but got 'object'"
    expect(results.errors["bad_args"].message).to include(expected)
  end

  it "validates data_value" do
    example = {
      body: [
        { kind: "var_set",
          args: { data_type: "integer",
                  data_value: "1",
                  data_label: "valid" }
        }
      ]
    }
    results = Sequences::AstParser.run(example)
    expect(results.success?).to eq(true)
  end

  it "does not validate data type if data_type is wrong" do
    example = {
      body: [
        { kind: "var_set",
          args: { data_type: "integer",
                  data_value: "abc",
                  data_label: "invalid" }
        }
      ]
    }
    results = Sequences::AstParser.run(example)
    expect(results.success?).to eq(false)
    expect(results.errors["bad_args"].message).to eq(
      "Expected 'data_value' in step 1 to be an integer but got non-integer input")
  end
end
