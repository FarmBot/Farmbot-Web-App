class PasswordResetJob < ApplicationJob
  queue_as :default

  def perform(email)
    user = User.find_by(email: email.strip.downcase)
    return unless user

    token = PasswordResetToken.issue_to(user).encoded
    UserMailer.password_reset(user, token).deliver_later
  end
end
