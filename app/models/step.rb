class Step < ActiveRecord::Base

  MESSAGE_TYPES = %w(emergency_stop home_all home_x home_y home_z move_absolute
    move_relative pin_write read_parameter read_status write_parameter wait
    send_message if_statement read_pin)

  belongs_to :sequence
  validates :message_type, presence: true
  validates :position, presence: true

  has_many :step_params, dependent: :destroy

  def command=(step_params)
    ActiveRecord::Base.transaction do
      step_params
        .map { |k, v| StepParam.create!(step_id: id, key: k, value: v) }
        .inject({}) do |accum, step|
          accum[step.key] = step.value
          accum
        end
    end
  end

  def command
    self
      .step_params
      .inject({}) do |accum, step|
          accum[step.key] = step.value
          accum
      end
  end

  # def all_steps
  #   raise "NOT READY FOR USE"  
  #   (sequence.try(:steps) || Step.none).order(position: :asc)
  # end

  # def move_to!(position)
  #   raise "NOT READY FOR USE"
  #   new_steps = all_steps.to_a
  #   new_steps.delete_at(new_steps.index(self))
  #   new_steps.insert(position, self)
  #   new_steps.each_with_index do |step, index|
  #     step.position = index
  #     step.save!
  #   end
  # end

  # def reshuffle!
  #   raise "NOT READY FOR USE"  
  #   all_steps.each_with_index do |step, index|
  #     step.position = index
  #     step.save!
  #   end
  # end

  # def destroy(*args)
  #   result = super(*args)
  #   self.reshuffle!
  #   result
  # end
end
