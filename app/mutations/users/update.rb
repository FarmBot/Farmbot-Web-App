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
      set_unconfirmed_email if email.present?
      excludable = [:user]
      excludable.push(:email) unless skip_email_stuff
      user.update_attributes!(inputs.except(:user, :email))
      user.reload
    end

private

    # Self hosted users will often not have an email server.
    # We can update emails immediately in those circumstances.
    def skip_email_stuff
      @skip_email_stuff ||= !!ENV["NO_EMAILS"] || (email == user.email)
    end

    def set_unconfirmed_email
      return if skip_email_stuff
      # user.reset_confirmation_token
      user.unconfirmed_email = email
      user.save!
      UserMailer.email_update(user).deliver_later
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
