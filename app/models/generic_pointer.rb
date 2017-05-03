class GenericPointer < ActiveRecord::Base
  belongs_to :device
  has_one :point, as: :pointer
end
