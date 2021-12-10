# User definable key/value pairs, usually used for Farmware authorship.
class FarmwareEnv < ApplicationRecord
  belongs_to :device
  serialize :value
  validates :key, uniqueness: { scope: :device }
end
