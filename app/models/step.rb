class Step
  include Mongoid::Document
  include Mongoid::Timestamps

  MESSAGE_TYPES = %w(single_command read_status pin_write move_abs move_rel)

  embedded_in :sequence

  field :message_type
  validates :message_type, presence: true

  field :command, type: Hash, default: {}
  field :position, type: Integer, default: -> do
    (self.sequence.try(:steps) || []).count
  end
  # TODO : Move this into a refinement
  def destroy(*args)
    result = super(*args)
    self.reorder
    result
  end

  def position=(*args)
    result = super(*args)
    insert_position(*args)
    self.position
  end

  def insert_position(num)
    # Sort by position, then by updated_at
    return if sequence.try(:reload).nil?
    steps = sequence
              .steps
              .where(:position.gte => num, :_id.ne => _id)
              .order_by(:position.asc, :updated_at.desc)
    steps.each_with_index do |step, inx|
      step[:position] = inx + num + 1
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
