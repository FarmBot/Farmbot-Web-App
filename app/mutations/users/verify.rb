module Users
  class Verify < Mutations::Command
    required { model :user, class: User }

    def validate
      prevent_token_reuse
    end

    def execute
      user.confirmed_at = Time.now
      user.save!
      SessionToken.as_json(user.reload,
                           AbstractJwtToken::HUMAN_AUD,
                           Gem::Version.new("99.9.9"))
    end

    private

    def prevent_token_reuse
      raise User::AlreadyVerified if user.confirmed_at.present?
    end
  end
end
