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
      steps.pluck(:position).max + 1
    else
      0
    end
  end

  # TODO : Move this into a refinement =========================================
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

  def position=(num)
    result = super(num)
    insert_position(num)
    self.position
  end

  def insert_position(num)
    # Sort by position, then by updated_at
    next_steps.each_with_index do |step, inx|
      step[:position] = inx + num + 1
      step.save
    end
  end

  def next_steps
    if sequence.try(:reload).nil?
      Step.none
    else
      sequence
        .steps
        .where(:position.gte => self[:position], :_id.ne => _id)
        .order_by(:position.asc)
    end
  end

  def reorder
    # Sort by position, then by updated_at
    return if sequence.try(:reload).nil?
    steps = sequence.steps.order_by(:position.asc)
    steps.each_with_index do |step, inx|
      step[:position] = inx
      step.save
    end
  end
end
