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

  def move_to!(position)
    new_steps = all_steps.to_a
    new_steps.delete_at(new_steps.index(self))
    new_steps.insert(position, self)
    new_steps.each_with_index do |step, index|
      step.position = index
      step.save!
    end
  end

  def untangle!
    passed_self = false
    all_steps.each_with_index do |step, i|
      passed_self = true && next if step == self
      step.position = i
      step.position += 1 if passed_self
      step.save!
    end
  end

  def reshuffle!
    all_steps.each_with_index do |step, index|
      step.position = index
      step.save!
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
