class Step
  include Mongoid::Document
  include Mongoid::Timestamps

  MESSAGE_TYPES = %w(single_command read_status pin_write move_abs move_rel)

  embedded_in :sequence

  field :message_type
  validates :message_type, presence: true

  field :command, type: Hash, default: {}
  field :position, type: Integer, default: -> do
    (self.try(:sequence).try(:steps).try(:size) || 1) - 1 || 0
  end
  validates :position, presence: true
  # TODO : Move this into a refinement =========================================

  def all_steps
    (sequence.try(:steps) || Step.none).order_by(:position.asc)
  end

  def move_to!(p)
    direction = (position <=> p)
    reshuffle!
    self.position = p
    self.save!
    untangle!(direction)
    reshuffle! if sequence.steps.pluck(:position).min < 0
  end

  def untangle!(direction)
    return if direction == 0
    all_steps.each_with_index do |s, i|
      next if s == self
      operand    = (direction > 0) ? :+ : :-
      s.position = (s.position == self.position) ? i.send(operand, 1) : i
      s.save! if s.changed?
    end
  end

  def reshuffle!
    all_steps.each_with_index do |step, index|
      step.position = index
      step.save! if step.changed?
    end
  end

  def destroy(*args)
    result = super(*args)
    self.reshuffle!
    result
  end

  def set_relation(name, relation)
    if name == 'sequence' && self.sequence.present?
      raise 'Sequence reassignment not supported'
    else
      super(name, relation)
    end
  end

end
