# If a node in the sequence node tree has a `kind` and `args` property, it is
# said to be a properly formed "PrimaryNode".
# CeleryScript is a tree of PrimaryNode objects in the center and primitice
# "EdgeNode" types on the edge of the tree.
class PrimaryNode < ApplicationRecord
  belongs_to            :sequence
  validates_presence_of :sequence
  has_many   :edge_nodes
  # BAD_KIND = "must be a valid CeleryScript node name"
  # validates :kind, inclusion: { in:        CeleryScriptSettingsBag::ANY_ARG_NAME,
  #                               message:   BAD_KIND,
  #                               allow_nil: false }

  def todo
    [
      "add a `comments` field to `PrimaryNode`",
      "Destroy FarmEvent.if_still_using",
      "Migration: Destroy all sequence deps and update their sequence",
      "Destroy the seq deps model (but not the table- not yet)"
    ]
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

  def is_body_item? # Is this an arg or a body item?
    !self.parent_arg_name
  end

  def broadcast?
    false
  end
end