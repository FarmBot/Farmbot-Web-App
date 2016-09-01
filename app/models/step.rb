class Step < ActiveRecord::Base

  MESSAGE_TYPES = %w(emergency_stop home_all home_x home_y home_z move_absolute
    move_relative pin_write read_parameter read_status write_parameter wait
    send_message if_statement read_pin)


  belongs_to :sequence
  validates :message_type, presence: true
  validates :position, presence: true

  serialize :command
  # http://stackoverflow.com/a/5127684/1064917
  after_initialize :update_the_position

  def update_the_position
    # if sequence_id && self[:position].nil?
    #   # stepss = Step.where(sequence_id: sequence_id)
    #   self[:position] = (steps.count - 1)
    # else
      self[:position] = 0
    # end
  end

  def all_steps
    (sequence.try(:steps) || Step.none).order(position: :asc)
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
