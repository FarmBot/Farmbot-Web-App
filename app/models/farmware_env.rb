# User definable key/value pairs, usually used for Farmware authorship.
class FarmwareEnv < ApplicationRecord
  belongs_to :device
  serialize :value, coder: YAML
  validates :key, uniqueness: { scope: :device }
end
