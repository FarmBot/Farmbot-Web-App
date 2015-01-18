class Step
  include Mongoid::Document

  MESSAGE_TYPES = %w(single_command read_status pin_write pin_on pin_off
                     move_abs move_rel)

  embedded_in :sequence

  field :message_type
  validates :message_type, presence: true

  field :command, type: Hash, default: {}
end
