module Users
  class Update < Mutations::Command
    PASSWORD_PROBLEMS = "Password and confirmation(s) must match."
    EMAIL_IN_USE      = "That email is already registered"
    required { model :user, class: User }

    optional do
      string :email
      string :name
      string :password
      string :new_password
      string :new_password_confirmation
    end

    def validate
      confirm_new_password if password
      if((email != user.email) && User.where(email: email).any?)
        add_error(:email, :in_use, EMAIL_IN_USE)
      end
    end

    def execute
      maybe_update_email
      user.update_attributes!(inputs.except(:user, :email))
      user.reload
    end

private

    def maybe_update_email
      raise "TODO"
    end

    def confirm_new_password
        valid_pw   = user.valid_password?(password)
        has_new_pw = new_password && new_password_confirmation
        pws_match  = new_password == new_password_confirmation
        invalid    = !(valid_pw && has_new_pw && pws_match)
        if invalid
          add_error :password, :*, PASSWORD_PROBLEMS
        else
          inputs[:password] = inputs.delete(:new_password)
          inputs[:password_confirmation] = inputs.delete(:new_password_confirmation)
        end
    end
  end
end
