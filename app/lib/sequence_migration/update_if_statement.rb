module SequenceMigration
  # Background:
  # This is a refactor of what once was called the `if_statement` block:
  # * Added a `nothing` node type (sorry, we actually need it now).
  # * if_statement becomes _if
  # * sub_sequence_id becomes _then
  # * Add _else arg to _if.
  # * _then/_else expect a execute or nothing node instead of a number.
  class UpdateIfStatement < Base
    VERSION = 3
    CREATED_ON = "DECEMBER 20 2016"

    def up
      sequence
        .body
        .select { |x| x["kind"] == "if_statement" }
        .each   do |x|
          x["kind"] = "_if"
          x["args"] = {
                  "lhs": x["args"]["lhs"],
                  "rhs": x["args"]["rhs"],
                  "op": x["args"]["op"],
                  "_then": {
                      "kind": "execute",
                      "args": { "sub_sequence_id": x["args"]["sub_sequence_id"] }
                  },
                  "_else": { "kind": "nothing", "args": {} }
          }
        end
    end
  end
end
