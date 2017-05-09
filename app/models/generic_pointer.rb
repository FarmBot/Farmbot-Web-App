class GenericPointer < ActiveRecord::Base
  has_one :point, as: :pointer
end
