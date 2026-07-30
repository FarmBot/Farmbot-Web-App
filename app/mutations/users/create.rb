module Users
  class Create < Mutations::Command
    include Auth::ConsentHelpers
    include Users::EmailDomainHelpers

    ALREADY_REGISTERED = "Already registered"
    PASSWORD_PROBLEMS = "Password less than 8 characters or does not match " \
                        "password confirmation."

    required do
      string :name
      string :email
      string :password
      string :password_confirmation
    end

    optional do
      boolean :agree_to_terms
      boolean :skip_email, default: User::SKIP_EMAIL_VALIDATION
    end

    def validate
      maybe_validate_tos
      maybe_check_email
      email.downcase!
      add_error :email, :*, ALREADY_REGISTERED if User.find_by(email: email)
      pw_length_ok = password.length > 7
      pw_match = password == password_confirmation
      pw_invalid = !(pw_match && pw_length_ok)
      add_error :password, :*, PASSWORD_PROBLEMS if pw_invalid
    end

    def execute
      params = { email: email,
                 password: password,
                 password_confirmation: password_confirmation,
                 name: name }
      params[:agreed_to_terms_at] = Time.now
      user = User.new(params)
      Devices::Create.run!(user: user)
      user.save!
      UserMailer.welcome_email(user).deliver_later unless skip_email
      { message: "Check your email!" }
    end
  end
end
