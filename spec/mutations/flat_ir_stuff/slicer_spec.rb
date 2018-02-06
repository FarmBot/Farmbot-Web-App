require "spec_helper"
require_relative "./flat_ir_helpers"

describe CeleryScript::Slicer do
  kind   = CeleryScript::CSHeap::KIND
  parent = CeleryScript::CSHeap::PARENT
  next_  = CeleryScript::CSHeap::NEXT
  body   = CeleryScript::CSHeap::BODY

  CORRECT_LINKAGE = { # Came from the JS implementation which is known good.
    0 => { kind => "nothing",           parent => 0             },
    1 => { kind => "sequence",          parent => 0, body  => 2 },
    2 => { kind => "move_absolute",     parent => 1, next_ => 3 },
    3 => { kind => "coordinate",        parent => 2             },
    4 => { kind => "coordinate",        parent => 2             },
    5 => { kind => "move_relative",     parent => 2, next_ => 6 },
    6 => { kind => "write_pin",         parent => 5, next_ => 0 },
    7 => { kind => "scope_declaration", parent => 1             }
  }

  it "has edge cases" do
    output = CeleryScript::FlatIrHelpers.flattened_heap
    CORRECT_LINKAGE.to_a.map do |(index, expected)|
      actual = output[index]
      expect(actual[kind]).to        eq(expected[kind])
      expect(actual[parent].to_i).to eq(expected[parent]) if expected[parent]
      expect(actual[next_].to_i ).to eq(expected[next_])  if expected[next_]
      expect(actual[body].to_i  ).to eq(expected[body])   if expected[body]
    end
  end
end
