module Users
  class Reverify < Mutations::Command
    required { model :user, class: User }

    def execute
      user.update!(confirmed_at:      Time.now,
                              email:             user.unconfirmed_email,
                              unconfirmed_email: nil)
      fbos_vers = Gem::Version.new("99.9.9") # Not relevant here, stubbing out.
      SessionToken.as_json(user, AbstractJwtToken::HUMAN_AUD, fbos_vers)
    end
  end
end
