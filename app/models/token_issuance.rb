# Keep track of all JWTs created incase we need to revoke them later (before the
# expiration date).
class TokenIssuance < ApplicationRecord
  belongs_to :device

  def broadcast?
    false
  end
end
