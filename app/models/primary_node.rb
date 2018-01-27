class PrimaryNode < ApplicationRecord
  belongs_to :sequence
  belongs_to :parent, class_name: PrimaryNode
  has_many   :edge_nodes

  def todo
    "Make sure `kind` and `parent_arg_name` are valid"
  end
end