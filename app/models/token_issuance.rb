# Keep track of all JWTs created in case we need to revoke them later (before the
# expiration date).
class TokenIssuance < ApplicationRecord
  belongs_to :device
  # Number of seconds Rails will wait for the API.
  API_TIMEOUT = Rails.env.test? ? 0.01 : 2.5
  after_create :reset_inactivity_timer

  def broadcast?
    false
  end

  # PROBLEM:
  #     A token issuance was destroyed, but people are still on the broker using
  #     a revoked token.
  #
  # COMPLICATED SOLUTION:
  #     Track the JTI of all users and selectively boot only the users that have
  #     an expired JTI. This requires external caching and session storage.
  #
  # SIMPLE SOLUTION:
  #     Kick _everyone_ off the broker. The clients with the revoked token will
  #     not be able to reconnect.
  def maybe_evict_clients
    Timeout::timeout(API_TIMEOUT) do
      id = "device_#{device_id}"
      Transport::Mgmt.try(:close_connections_for_username, id)
    end
  rescue Faraday::ConnectionFailed, Timeout::Error
    Rollbar.error("Failed to evict clients on token revocation")
  end

  def self.expired
    self.where("exp < ?", Time.now.to_i)
  end

  def self.any_expired?
    expired.any?
  end

  def self.clean_old_tokens
    expired.destroy_all
  end

  def reset_inactivity_timer
    device.users.map(&:reset_inactivity_tracking!)
  end
end
