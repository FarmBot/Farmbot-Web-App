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
      email_is_invalid = attempting_email_change? && user_already_exists?
      add_error(:email, :in_use, EMAIL_IN_USE) if email_is_invalid
    end

    def execute
      maybe_perform_password_reset
      user.update_attributes!(calculated_update)
      user.reload
    end

private

    def attempting_email_change?
      email != user.email
    end

    def user_already_exists?
      User.where(email: email).any?
    end

    # Self hosted users will often not have an email server.
    # We can update emails immediately in those circumstances.
    def skip_email_stuff
      ENV["NO_EMAILS"] || (email == user.email)
    end

    # Revoke all session tokens except for the person who requested
    # the password change.
    def delete_all_tokens_except_this_one
      TokenIssuance
        .where(device_id: user.device.id)
        .where
        .not(jti: (RequestStore[:jwt] || {})[:jti])
        .destroy_all
    end

    # Send a `factory_reset` RPC over AMQP/MQTT to all connected devices.
    # Locks everyone out after a password reset.
    def maybe_perform_password_reset
      if inputs[:password]
        SendFactoryResetJob.perform_later(user.device)
        delete_all_tokens_except_this_one
      end
    end

    def set_unconfirmed_email
      user.reset_confirmation_token
      user.unconfirmed_email = email
      user.save!
      UserMailer.email_update(user).deliver_later
    end

    def calculated_update
      attributes_excluded_from_update = [:user]
      unless skip_email_stuff
        set_unconfirmed_email if email.present?
        attributes_excluded_from_update.push(:email)
      end
      inputs.except(*attributes_excluded_from_update)
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
