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
      User.create!(email:                 email,
                   password:              password,
                   password_confirmation: password_confirmation,
                   name:                  name)
    end
  end
end
