module Api
  class UsersController < Api::AbstractController
    skip_before_action :authenticate_user!, only: [:create,
                                                   :verify,
                                                   :resend_verification]

    def create
      mutate Users::Create.run(user_params)
    end

    def update
      mutate Users::Update.run(user_params, user: current_user)
    end

    def destroy
      mutate Users::Destroy.run(user_params, user: current_user)
    end

    def show
      render json: current_device.users
    end

    def resend_verification
      mutate Users::ResendVerification
               .run(user: User.find_by!(email: raw_json[:email]))
    end

    def control_certificate
      mutate Users::GenerateControlCert.run(raw_json, device: current_device)
    end

    private

    def user_params
      user = raw_json
        .merge!(raw_json[:user] || {})
        .deep_symbolize_keys
      { email: user[:email],
       name: user[:name],
       password: user[:password],
       password_confirmation: user[:password_confirmation],
       new_password: user[:new_password],
       new_password_confirmation: user[:new_password_confirmation],
       agree_to_terms: user[:agree_to_terms] }
    end
  end
end
