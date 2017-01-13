module Users
  class Create < Mutations::Command
    required do
      string :name
      string :email
      string :password
      string :password_confirmation
    end

    def validate
      email.downcase!
      add_error :email, :*, 'Already registered' if User.find_by(email: email)
      if password != password_confirmation
        add_error :password, :*, 'Password and confirmation do not match.'
      end
    end

    def execute
      user   = User.create!(email:                 email,
                            password:              password,
                            password_confirmation: password_confirmation,
                            name:                  name)
      device = Devices::Create.run!(user: user)
      UserMailer.welcome_email(user).deliver_later
      {message: "Check your email!"}
    end
  end
end
