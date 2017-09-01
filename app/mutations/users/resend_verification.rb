module Users
  class ResendVerification < Mutations::Command
    ALREADY_VERIFIED = "already verified"
    SENT             = "Check your email!"

    required { model :user, class: User }

    def validate
      add_error(:user, :already_verified, ALREADY_VERIFIED) if user.verified?
    end

    def execute
      UserMailer.welcome_email(user).deliver_later
      {user: SENT}
    end
  end
end
