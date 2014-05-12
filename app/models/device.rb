# FarmbotDevice models all data related to an actual FarmBot in the real world.
# This is useful for caching things like SkyNey IDs, owner users, work logs, etc
class Device
  include Mongoid::Document
  belongs_to :user

  field :uuid
  field :name
  field :token
end
