class Step
  include Mongoid::Document

  MESSAGE_TYPES = %w(emergency_stop home_all home_x home_y home_z move_absolute
    move_relative pin_write read_parameter read_status write_parameter wait)

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
end
