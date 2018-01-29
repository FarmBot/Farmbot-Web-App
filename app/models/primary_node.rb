class PrimaryNode < ApplicationRecord
  belongs_to :sequence, required: true
  has_one    :parent, class_name: "PrimaryNode", foreign_key: "parent_id"
  has_one    :child,  class_name: "PrimaryNode", foreign_key: "child_id"
  has_many   :edge_nodes

  def todo
    "Make sure `kind` and `parent_arg_name` are valid"
  end
end