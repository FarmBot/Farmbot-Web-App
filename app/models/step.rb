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
    self.update_attributes!(position: p)
    untangle!(direction)
    reshuffle!
  end

  def untangle!(direction)
    puts "\n\n\n"
    steps = all_steps
    steps.each_with_index do |s, i|
      operand = (direction > 0) ? :+ : :-
      old = s.position
      if s == self
        puts "#{old} => #{s.position} direction: #{direction} i: #{i} operand: #{operand}."
        next
      end
      s.position = (s.position == self.position) ? i.send(operand, 1) : i
      puts "#{old} => #{s.position} direction: #{direction} i: #{i} operand: #{operand}."
      s.save! if s.changed?
    end
  end

  def reshuffle!
    old = all_steps.pluck(:position).sort
    all_steps.each_with_index do |step, index|
      step.position = index
      step.save! if step.changed?
    end
    puts "#{old} => #{all_steps.pluck(:position).sort}"
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
