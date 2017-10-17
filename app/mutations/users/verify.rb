module Users
  class Verify < Mutations::Command
    required { string :token, min_length: 5 }

    def validate
    end

    def execute
      user.verified_at = Time.now
      # Prevent token reuse:
      user.confirmation_token = ""
      user.save!
      SessionToken.as_json(user.reload, AbstractJwtToken::HUMAN_AUD)
    end

private
    def user
      @user ||= User.find_by!(confirmation_token: token)
    end
  end
end
