class Step
  include Mongoid::Document
  include Mongoid::Timestamps

  MESSAGE_TYPES = %w(single_command read_status pin_write move_abs move_rel)

  embedded_in :sequence

  field :message_type
  validates :message_type, presence: true

  field :command, type: Hash, default: {}
  field :position, type: Integer, default: -> do
    steps = self.sequence.try(:steps)
    if steps
      (steps.pluck(:position).max) + 1
    else
      0
    end
  end
  validates :position, presence: true
  # TODO : Move this into a refinement =========================================
  def move_to!(p)
    steps = all_steps
    steps.each_with_index do |step, index|
      its_me = (self == step)
      # TODO test these. Coverage tool might not catch a lack of coverage.
      p = steps.size - 1  if p >= sequence.steps.size
      p = 0 if p < 0
      if index < p
        step.position = index
      else
        step.position = index + 1
      end
      step.position = p if its_me
      step.save!
    end
  end

  def all_steps
    (sequence.try(:steps) || Step.none).order_by(:position.asc)
  end

  def destroy(*args)
    result = super(*args)
    self.reorder
    result
  end

  def set_relation(name, relation)
    if name == 'sequence' && self.sequence.present?
      raise 'Sequence reassignment not supported'
    else
      super(name, relation)
    end
  end

  def reorder
    all_steps.each_with_index do |step, index|
      case index <=> position
      when -1 # Below target
        # Autocorrects drift
        if step.position != index
          warn 'How?'
          step.position = index
          step.save!
        end
      when 0 # At target
        if step == self
          step.position = index
        else
          step.position = index + 1
        end
        step.save!
      when 1 # Above target
        step.position = index + 1
        step.save!
      end
    end
  end
end
