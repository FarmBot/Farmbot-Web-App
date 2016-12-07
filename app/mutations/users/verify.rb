module Users
  class Verify < Mutations::Command
    required { string :token, min_length: 5 }

    def validate
    end

    def execute
      user.verified_at = Time.now
      user.verification_token = ""
      user.save!
      user
    end

private
    def user
      @user ||= User.find_by(verification_token: token)
    end
  end
end
