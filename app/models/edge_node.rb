# In a CeleryScript flat IR tree, primitive values are stored as edge nodes.
# Canonical representation:
#  `args: {speed: 100}`
# IR representation:
#   `{sequence_id: 6, primary_node_id: 7 kind: "speed" value: "100"}`
class EdgeNode < ApplicationRecord
  belongs_to :sequence
  validates_presence_of :sequence
  belongs_to :primary_node
  serialize  :value, JSON

  def broadcast?
    false
  end

  # `value` is a serialized column.
  # That makes stuff like this hard to do in ActiveRecord:
  # SELECT * FROM edge_nodes WHERE value = (1,2,3)
  # This helper makes it possbile like this:
  # EdgeNode.where(EdgeNode.value_is_one_of("A", ["b"], 3))
  def self.value_is_one_of(*values)
    EdgeNode.arel_table[:value].in(values)
  end
end
