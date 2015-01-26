class Step
  include Mongoid::Document
  include Mongoid::List

  MESSAGE_TYPES = %w(single_command read_status pin_write move_abs move_rel)

  embedded_in :sequence
  lists scope: :sequence

  field :message_type
  validates :message_type, presence: true

  field :command, type: Hash, default: {}
  field :position, default: -> do
    # If not set, default to being last item in the list.
    sequence? ? sequence.steps.pluck(:position).max + 1 : 1
  end

  validates_presence_of :position
  validates_uniqueness_of :position, scope: :sequence
end
