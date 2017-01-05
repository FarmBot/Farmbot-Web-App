module SequenceMigration
  # Background:
  # This is a refactor of what once was called the `if_statement` block:
  # * Added a `nothing` node type (sorry, we actually need it now).
  # * if_statement becomes _if
  # * sub_sequence_id becomes _then
  # * Add _else arg to _if.
  # * _then/_else expect a execute or nothing node instead of a number.
  class CleanupArgNames < Base
    VERSION    = 4
    CREATED_ON = "January 5 2017"

    def up
      sequence.traverse do |node|
        puts node[:kind]
      end
    end
  end
end
