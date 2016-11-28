module Users
  class Create < Mutations::Command
    required do
      string :name
      string :email
      string :password
      string :password_confirmation
    end

    def validate
      if password != password_confirmation
        add_error :password, :*, 'Password and confirmation do not match.'
      end
    end

    def execute
      resp = {}

      resp[:user]  = User.create!(email:                 email.downcase,
                                  password:              password,
                                  password_confirmation: password_confirmation,
                                  name:                  name)

      device     = Devices::Create.run!(user: resp[:user])
      auth_stuff = Auth::CreateToken.run!(email: email, password: password)
      resp.merge!(auth_stuff)
      SendWelcomeEmailJob.perform_later(resp[:user])
      resp
    end
  end
end
