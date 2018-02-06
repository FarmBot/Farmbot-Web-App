# A CeleryScript AST tree entry that is not a "proper"
# CS node (no `args` or `kind` fields) is called an "edge node". A CeleryScript
# primitive of sorts.
class EdgeNode < ApplicationRecord
  belongs_to :sequence
  validates_presence_of :sequence
  belongs_to :primary_node
  serialize  :value, JSON
  # BAD_KIND = "must be a valid CeleryScript node name"
  # validates :kind, inclusion: { in: CeleryScriptSettingsBag::ANY_NODE_NAME,
  #                                   message: BAD_KIND,
  #                                   allow_nil: false }


  def broadcast?
    false
  end
end