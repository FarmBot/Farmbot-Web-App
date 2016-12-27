# Like any other programming language, sequences need to manage dependencies.
# A SequenceDependency lets the API know that a particular resource is "IN USE"
# by a Sequence (program).
# Example: SEQUENCE1 has an `_if` block that jumps to SEQUENCE2. Deleting
#          SEQUENCE2 would break SEQUENCE1. Creating a SequenceDependency for
#          SEQUENCE1 and SEQUENCE2 prevents accidental deletion. The user must
#          now delete SEQUENCE2 prior to deleting SEQUENCE1.
class SequenceDependency < ActiveRecord::Base
  belongs_to :sequence
  belongs_to :dependency, polymorphic: true
end
