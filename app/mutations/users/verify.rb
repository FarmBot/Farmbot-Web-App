module Users
  class Verify < Mutations::Command
    required { string :token, min_length: 5 }

    def validate
      prevent_token_reuse
    end

    def execute
      user.confirmed_at = Time.now
      user.save!
      SessionToken.as_json(user.reload, AbstractJwtToken::HUMAN_AUD)
    end

private

    def prevent_token_reuse
      raise User::AlreadyVerified if user.confirmed_at.present?
    end

    def user
      @user ||= User.find_by!(confirmation_token: token)
    end
  end
end
