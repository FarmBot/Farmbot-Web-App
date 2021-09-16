module Users
  class CreateDemo < Mutations::Command
    required { string :secret }

    def execute
      self.delay.doing_it_asap
      {}
    end

    def doing_it_asap
      create_user
      update_fields
      seed_user
      broadcast_the_token
    end

    private

    def email
      @email ||= ["guest_",
                  SecureRandom.alphanumeric.downcase,
                  "@farmbot.guest"].join("")
    end

    def user
      @user ||= User.find_by!(email: email)
    end

    def create_user
      Users::Create.run!(name: "Guest",
                         email: email,
                         password: secret,
                         password_confirmation: secret,
                         agree_to_terms: true,
                         skip_email: true)
    end

    def update_fields
      user.update!(confirmed_at: Time.now)
    end

    def seed_user
      Devices::CreateSeedData.run!(device: user.device,
                                   product_line: "demo_account")
    end

    def broadcast_the_token
      Transport.current.send_demo_token_to(user, secret)
    end
  end
end
