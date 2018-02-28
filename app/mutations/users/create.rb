module Users
  class Create < Mutations::Command
    include Auth::ConsentHelpers

    required do
      string :name
      string :email
      string :password
      string :password_confirmation
    end

    optional do
      boolean :agree_to_terms
    end

    def validate
      maybe_validate_tos
      email.downcase!
      add_error :email, :*, 'Already registered' if User.find_by(email: email)
      if password != password_confirmation
        add_error :password, :*, 'Password and confirmation do not match.'
      end
    end

    def execute
      params = { email:                 email,
                 password:              password,
                 password_confirmation: password_confirmation,
                 name:                  name }
      params[:agreed_to_terms_at] = Time.now
      user   = User.create!(params)
      device = Devices::Create.run!(user: user)
      UserMailer
        .welcome_email(user)
        .deliver_later unless User::SKIP_EMAIL_VALIDATION
      {message: "Check your email!"}
    end
  end
end
