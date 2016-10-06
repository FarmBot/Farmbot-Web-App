require 'spec_helper'

describe Sequences::AstSyntaxChecker do
  let(:nodes) {
      # Big 'ol node tree.
      JSON.parse(
        '[{"kind":"move_absolute","args":{"x":1,"y":2,"z":3,"speed":4}}'+
        ',{"kind":"move_relative","args":{"x":1,"y":2,"z":3,"speed":4}}'+
        ',{"kind":"write_pin","args":{"pin_number":1,"pin_value":0,'+
        '"pin_mode":1}},{"kind":"read_pin","args":{"pin_number":1,"data_label"'+
        ':"probably_a_variable"}},{"kind":"wait","args":{"milliseconds":5000}}'+
        ',{"kind":"send_message","args":{"message":"Value is {{ '+
        'probably_a_variable }}"}},{"kind":"execute","args":{"sub_sequence_id":'+
        '123}},{"kind":"if_statement","args":{"lhs":"x","op":">","rhs":5,'+
        '"sub_sequence_id":123}}]')
  }
  it 'validates the sequence AST' do
    result = Sequences::AstSyntaxChecker.run!(body: nodes)
    expect(result.length).to eq(nodes.length)
    nodes.each_with_index do |node, index|
      expect(result[index][:kind]).to eq(node["kind"])
    end
  end

  it 'strips out useless args' do
    nodes[0]["foo"] = "bar"
    results = Sequences::AstSyntaxChecker.run!(body: nodes)
    expect(results.map { |i| i["foo"] }.uniq!.first).to eq(nil)
  end

  it 'allows comments' do
    msg = "Just like a real programming language"
    nodes[0]["comments"] = msg
    results = Sequences::AstSyntaxChecker.run!(body: nodes)
    expect(results[0]["comments"]).to eq(msg)
  end

  it 'explains invalid args' do
    nodes[3]["args"]["pin_number"] = {}
    results = Sequences::AstSyntaxChecker.run(body: nodes)
    expect(results.success?).to eq(false)
    expect(results.errors.length).to eq(1)
    actual = results.errors["bad_args"].message
    expected = "Expected 'pin_number' of step 4 to be Fixnum, got ActiveSupport::HashWithIndifferentAccess"
    expect(actual).to eq(expected)
  end

  it 'ensures that mode is 0 or 1' do
    nodes[2]["args"]["pin_mode"] = 6 # Not valid.
    results = Sequences::AstSyntaxChecker.run(body: nodes)
    expect(results.success?).to eq(false)
    expect(results.errors.length).to eq(1)
    actual = results.errors["bad_args"].message
    expected = "Expected 'pin_mode' of step 3 to be 0 or 1, got 6"
    expect(actual).to eq(expected)
  end

  it 'validates lhs' do
    nodes.last["args"]["lhs"] = "foo"
    results = Sequences::AstSyntaxChecker.run(body: nodes)
    expected = "Expected 'lhs (left hand side)' of step 8 to be one of:"
    expect(results.errors["bad_args"].message).to include(expected)
  end

  it 'validates op' do
    nodes.last["args"]["op"] = "/"
    results = Sequences::AstSyntaxChecker.run(body: nodes)
    expected = "Expected 'op (operand)' of step 8 to be < or > or is or not, got /"
    expect(results.errors["bad_args"].message).to include(expected)
  end

end
