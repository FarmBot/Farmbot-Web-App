module Api
  class PasswordResetsController < Api::AbstractController
    skip_before_action :authenticate_user!, only: [:create, :update]

    def create
      mutate PasswordResets::Create.run(email: params[:email])
    end

    def update
      mutate PasswordResets::Update.run(
        password:              params[:password],
        password_confirmation: params[:password_confirmation],
        token:                 params[:id])
    end
  end
end
