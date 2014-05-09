class FarmbotDevice
  include Mongoid::Document
  belongs_to :user
end
