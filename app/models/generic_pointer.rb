class GenericPointer < ApplicationRecord
  has_one :point, as: :pointer

  def broadcast?
    false
  end
end
