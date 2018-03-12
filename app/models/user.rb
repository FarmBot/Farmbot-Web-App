# A human
class User < ApplicationRecord
  class AlreadyVerified < StandardError; end
  ENFORCE_TOS           = ENV.fetch("TOS_URL") { false }
  SKIP_EMAIL_VALIDATION = ENV.fetch("NO_EMAILS") { false }
  validates :email, uniqueness: true

  belongs_to :device, dependent: :destroy

  devise :database_authenticatable
  devise :trackable

  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults

  def self.try_auth(email, password)
    user = User.where(email: email).first
    (user && user.valid_password?(password)) ? yield(user) : yield(nil)
  end

  def set_defaults
    self.confirmation_token || self.reset_confirmation_token
  end

  def reset_confirmation_token
    self.confirmation_token = SecureRandom.uuid
  end

  def must_consent?
    ENFORCE_TOS && !agreed_to_terms_at
  end

  def require_consent!
    raise Errors::LegalConsent if must_consent?
    self
  end

  def verified?
    SKIP_EMAIL_VALIDATION ? true : !!confirmed_at
  end

  BAD_SUB = "SUB was neither string nor number"
  class BadSub < StandardError; end # Safe to remove December '17 -RC
  def self.find_by_email_or_id(sub) # Safe to remove December '17 -RC
    case sub
    when Integer then User.find(sub)
    # HISTORICAL CONTEXT: We once used emails as a `sub` field. At the time,
    # it seemed nice because it was human readable. The problem was that
    # emails are mutable. Under this scheme, changing your email address
    # would invalidate your JWT. Switching it to user_id (that does not
    # change) gets around this issue. We still need to support emails in
    # JWTs, atleast for another month or so because it would invalidate
    # existing tokens otherwise.
    # TODO: Only use user_id (not email) for validation after 25 OCT 17 - RC
    when String then User.find_by!(email: sub)
    else raise BadSub, BAD_SUB
    end
  end
end
