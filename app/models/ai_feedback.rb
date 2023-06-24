class AiFeedback < ApplicationRecord
  belongs_to :device
  validates :device, presence: true

  def broadcast?
    false
  end
end
