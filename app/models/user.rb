# A human
class User < ActiveRecord::Base
  ENFORCE_TOS = ENV.fetch("TOS_URL") { false }
  belongs_to :device, dependent: :destroy

  devise :database_authenticatable, :trackable

  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults

  def require_consent!
    raise Errors::LegalConsent if ENFORCE_TOS && !agreed_to_terms_at
    self
  end

  def set_defaults
    self.verification_token ||= SecureRandom.uuid
  end

  def verified?
    !!verified_at
  end
end
