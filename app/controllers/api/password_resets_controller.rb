module Api
  class PasswordResetsController < Api::AbstractController
    skip_before_action :authenticate_user!, only: [:create, :update]

    def create
      mutate PasswordResets::Create.run(email: raw_json[:email])
    end

    def update
      mutate PasswordResets::Update.run(
        password: raw_json[:password],
        password_confirmation: raw_json[:password_confirmation],
        token: raw_json[:id],
      )
    end
  end
end
