module Api
  class DemoAccountsController < Api::AbstractController
    skip_before_action :authenticate_user!, only: :create

    # Usually mutations go in seperate files.
    # In the case of demo accounts, I want the
    # feature to be easy to delete. If we decide
    # that things are working fine later on, we
    # can move this out.
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

    def create
      mutate CreateDemo.run(create_params)
    end

    private

    def create_params
      @create_params ||= { secret: raw_json.fetch(:secret) }
    end
  end
end
