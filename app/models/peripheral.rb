class Peripheral < ActiveRecord::Base
  belongs_to :device
  validates :device, presence: true
  validates :pin, presence: true
  validates :pin, uniqueness: { scope: :device }
  validates :mode, inclusion: { in: Sequence::ALLOWED_PIN_MODES }
  validates :label, presence: true
end
