class Peripheral < ActiveRecord::Base
  belongs_to :device
  validates_presence_of :device
  validates_presence_of :pin
  validates_uniqueness_of :pin, scope: :device
  validates_inclusion_of :mode, in: Sequence::ALLOWED_PIN_MODES
  validates_presence_of :label
end
