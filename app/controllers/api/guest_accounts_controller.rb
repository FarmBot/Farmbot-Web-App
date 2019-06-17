module Api
  class GuestAccountsController < Api::AbstractController
    skip_before_action :authenticate_user!, only: :create

    # Usually mutations go in seperate files.
    # In the case of Guest accounts, I want the
    # feature to be easy to delete. If we decide
    # that things are working fine later on, we
    # can move this out.
    class CreateGuest < Mutations::Command
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
        user.update_attributes!(confirmed_at: Time.now)
      end

      def seed_user
        Devices::CreateSeedData.run!(device: user.device,
                                     product_line: "express_xl_1.0")
      end

      def broadcast_the_token
        fbos_version = Api::AbstractController::EXPECTED_VER
        routing_key =
          [Api::RmqUtilsController::GUEST_REGISTRY_ROOT, secret].join(".")
        payload =
          SessionToken.as_json(user, "GUEST", fbos_version).to_json
        Transport.current.raw_amqp_send(payload, routing_key)
      end
    end

    def create
      mutate CreateGuest.run(create_params)
    end

    private

    def create_params
      @create_params ||=
        { secret: params[:secret] }
    end
  end
end
