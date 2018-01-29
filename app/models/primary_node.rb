# If a node in the sequence node tree has a `kind` and `args` property, it is
# said to be a properly formed "PrimaryNode".
# CeleryScript is a tree of PrimaryNode objects in the center and primitice
# "EdgeNode" types on the edge of the tree.
class PrimaryNode < ApplicationRecord
  belongs_to :sequence, required: true
  has_one    :parent, class_name: "PrimaryNode", foreign_key: "parent_id"
  has_one    :child,  class_name: "PrimaryNode", foreign_key: "child_id"
  has_many   :edge_nodes

  def todo
    [
      "Make sure `kind` and `parent_arg_name` are valid",
      "Turn off auto-sync for this class and EdgeNode"
    ]
  end
end