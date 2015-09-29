# FarmbotDevice models all data related to an actual FarmBot in the real world.
# This is useful for caching things like SkyNey IDs, owner users, work logs, etc
class Device
  include Mongoid::Document

  has_many :users
  has_many :schedules, dependent: :destroy
  has_many :sequences
  has_many :crops, dependent: :destroy


  # The SkyNet UUID of the device
  field :uuid
  validates :uuid, presence: true
  # The SkyNet Authentication token for the device
  field :token
  validates :token, presence: true
  # The 'Friendly Name' of the device. I recommend 'The Cabbage Patch Kid'
  field :name
  validates :name, presence: true

  def if_not_null
    yield(self)
    self
  end

  def if_null
    self
  end
end
