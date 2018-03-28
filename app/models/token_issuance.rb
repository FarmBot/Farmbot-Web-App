class TokenIssuance < ApplicationRecord
  belongs_to :device

  def broadcast?
    false
  end
end
