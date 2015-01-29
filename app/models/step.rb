class Step
  include Mongoid::Document
  include Mongoid::Timestamps

  MESSAGE_TYPES = %w(single_command read_status pin_write move_abs move_rel)

  embedded_in :sequence

  field :message_type
  validates :message_type, presence: true

  field :command, type: Hash, default: {}
  field :position, type: Integer, default: -> do
    self.try(:sequence).try(:steps).try(:size) || 0
  end
  validates :position, presence: true
  # TODO : Move this into a refinement =========================================

  def all_steps
    (sequence.try(:steps) || Step.none).order_by(:position.asc)
  end

  def move_to!(p)
    # TODO bound checking of p
    puts "#{self.position} <=> #{p} = #{self.position <=> p}"
    # TODO test these. Coverage tool might not catch a lack of coverage.
    # p =  - 1  if p >= sequence.steps.size
    p = 0 if p < 0
    case self.position <=> p
    when -1
      move_up!(p)
    when 0
      reshuffle!
    when 1
      move_down!(p)
    end
  end

  def move_up!(p)
    steps = all_steps
    steps.each_with_index do |step, index|
      its_me = (self == step)
      if index > p
        step.position = index
      else
        #TODO negative values
        step.position = index - 1
      end
      step.position = p if its_me
      step.save!
    end
  end

  def reshuffle!
    steps = all_steps
    steps.each_with_index do |step, index|
      step.position = index
      step.save!
    end
  end

  def move_down!(p)
    steps = all_steps
    steps.each_with_index do |step, index|
      its_me = (self == step)
      if index < p
        step.position = index
      else
        step.position = index + 1
      end
      step.position = p if its_me
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
