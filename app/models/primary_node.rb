# SCHEDULED DEPRECATION:
#   Node/PrimaryPair/PrimitivePair/Fragment will superceeded this model
#   eventually
# If a node in the sequence node tree has a `kind` and `args` property, it is
# said to be a properly formed "PrimaryNode". Everything else is an `EdgeNode`.
# CeleryScript is a tree of PrimaryNode objects in the center and primitive
# "EdgeNode" types on the edge of the tree.
class PrimaryNode < ApplicationRecord
  belongs_to            :sequence
  validates_presence_of :sequence
  has_many   :edge_nodes
  BAD_KIND = "`kind` must be one of: " +
              CeleryScriptSettingsBag::ANY_NODE_NAME.join(", ")
  validates :kind, inclusion: { in: CeleryScriptSettingsBag::ANY_NODE_NAME,
                                message: BAD_KIND,
                                allow_nil: false }
  validates :parent_arg_name,
    inclusion: {in:        CeleryScriptSettingsBag::ANY_ARG_NAME,
                message:   BAD_KIND,
                allow_nil: true}

  before_save :next_must_be_body_node

  def next_must_be_body_node
    raise "NO!" if(next_id && self.class.find(next_id).parent_arg_name)
  end

  def parent
    self.class.find_by(id: parent_id)
  end

  def body
    self.class.find_by(id: body_id)
  end

  def next
    self.class.find_by(id: next_id)
  end

  def broadcast?
    false
  end
end
