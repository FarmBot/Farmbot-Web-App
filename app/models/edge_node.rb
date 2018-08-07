# In a CeleryScript flat IR tree, primitive values are stored as edge nodes.
# Canonical representation:
#  `args: {speed: 100}`
# IR representation:
#   `{sequence_id: 6, primary_node_id: 7 kind: "speed" value: "100"}`
class EdgeNode < ApplicationRecord
  belongs_to            :primary_node
  belongs_to            :sequence
  serialize             :value, JSON
  validates_presence_of :sequence

  def broadcast?
    false
  end

  def is_sequence_id?
    kind == "sequence_id"
  end

  after_save :maybe_cascade_changes

  def maybe_cascade_changes
    (the_changes["value"] || []) # Grab old ID _AND_ new ID
      .compact
      .uniq
      .reject { |x| x == sequence_id } # 🤯 Skip recursive nodes
      .map { |x| Sequence.find_by(id: x) }
      .compact
      .map { |x| x.delay.broadcast!(Transport.current.cascade_id) } if is_sequence_id?
  end

  after_destroy :hmm

  def hmm
    Sequence.find(self.value).delay.broadcast! if is_sequence_id?
  end
end
