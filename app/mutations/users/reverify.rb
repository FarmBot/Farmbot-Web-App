module Users
  class Reverify < Mutations::Command
    required { model :user, class: User }

    def execute
      user.update_attributes!(confirmation_token: nil,
                              confirmed_at:       Time.now,
                              email:              user.unconfirmed_email,
                              unconfirmed_email:  nil)
      SessionToken.as_json(user, AbstractJwtToken::HUMAN_AUD)
    end
  end
end
