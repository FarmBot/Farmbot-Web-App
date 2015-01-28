class Step
  include Mongoid::Document
  include Mongoid::Orderable
  include Mongoid::Timestamps

  MESSAGE_TYPES = %w(single_command read_status pin_write move_abs move_rel)

  embedded_in :sequence
  orderable base: 0
  field :message_type
  validates :message_type, presence: true

  field :command, type: Hash, default: {}
end
