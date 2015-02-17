class Step
  include Mongoid::Document

  MESSAGE_TYPES = %w(single_command read_status pin_write pin_read move_abs move_rel wait send_message)

  embedded_in :sequence

  field :message_type
  validates :message_type, presence: true

  field :command, type: Hash, default: {}
  field :position, type: Integer, default: -> do
    if sequence && sequence.steps.present?
      sequence.steps.size - 1
    else
      0
    end
  end
  validates :position, presence: true

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
