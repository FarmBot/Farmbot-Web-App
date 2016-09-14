module Users
  class Create < Mutations::Command
    HOST = Rails.application.routes.default_url_options[:host]
    PORT = Rails.application.routes.default_url_options[:port]

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

      resp[:user]  = User.create!(email:                 email,
                                  password:              password,
                                  password_confirmation: password_confirmation,
                                  name:                  name)

      device = Devices::Create.run!(user: resp[:user])

      resp.merge!(Auth::CreateToken.run!(email:   email,
                                         password: password,
                                         host: "http://#{ HOST }:#{ PORT }"))
    end
  end
end
