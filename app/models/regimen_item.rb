# If a Regimen is an ordered checklist of sequences that must be executed,
# the RegimenItem represents one item on the todo list.
# This is a join table. a Regimen can have many sequences. A sequence
# can be used in many regimens. RegimenItem links a sequence and regimen.
class RegimenItem < ApplicationRecord
  belongs_to :regimen
  belongs_to :sequence
  validates  :sequence, presence: true

  after_destroy :cascade_destruction
  after_save    :maybe_cascade_save

  def maybe_cascade_save
    (the_changes["sequence_id"] || [])
      .compact
      .map { |x| Sequence.find_by(id: x) }
      .compact
      .map { |x| x.broadcast!(Transport.current.cascade_id) }
  end

  def cascade_destruction
    s = Sequence.find_by(id: sequence_id)
    s.delay.broadcast! if s
  end

  def broadcast?
    false
  end
end
