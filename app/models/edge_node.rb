# A CeleryScript AST tree entry that is not a "proper"
# CS node (no `args` or `kind` fields) is called an "edge node". A CeleryScript
# primitive of sorts.
class EdgeNode < ApplicationRecord
  belongs_to :sequence
  validates_presence_of :sequence
  belongs_to :primary_node
  serialize  :value, JSON
end