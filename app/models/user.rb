# A human
class User < ApplicationRecord
  class AlreadyVerified < StandardError; end

  ENFORCE_TOS = ENV.fetch("TOS_URL") { false }
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

  def update_tracked_fields!(request)
    super(request) unless FbosDetector.is_fbos_ua?(request)
  end

  def self.refresh_everyones_ui
    msg = {
      "type" => "reload",
      "commit" => (ENV["HEROKU_SLUG_COMMIT"] || "NONE").first(8),
    }

    Transport
      .current
      .raw_amqp_send(msg.to_json, Api::RmqUtilsController::PUBLIC_BROADCAST)
  end

  # The web app deletes account that go inactive for long periods.
  # It is called when the user logs in to the app.
  def reset_inactivity_tracking!
    update!(inactivity_warning_sent_at: nil)
  end

  def send_inactivity_warning
    User.transaction do
      update!(inactivity_warning_sent_at: Time.now)
      InactivityMailer.send_warning(self).deliver_later
      puts "INACTIVITY WARNING FOR #{email}" unless Rails.env.test?
    end
  end

  def deactivate_account
    User.transaction do
      if reload.last_sign_in_at > 3.months.ago
        raise "HALTING ERRONEOUS DELETION"
      end
      # Prevent double deletion / race conditions.
      update!(last_sign_in_at: Time.now, inactivity_warning_sent_at: nil)
      email = self.email
      delay.destroy!
      puts "INACTIVITY DELETION FOR #{email}" unless Rails.env.test?
    end
  end
end
