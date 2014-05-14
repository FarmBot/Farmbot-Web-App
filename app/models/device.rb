# FarmbotDevice models all data related to an actual FarmBot in the real world.
# This is useful for caching things like SkyNey IDs, owner users, work logs, etc
class Device
  include Mongoid::Document

  belongs_to :user

  # The SkyNet UUID of the device
  field :uuid
  validates :uuid, presence: true
  # The SkyNet Authentication token for the device
  field :token
  validates :token, presence: true
  # The 'Friendly Name' of the device. I recommend 'The Cabbage Patch Kid'
  field :name
  validates :name, presence: true
end
