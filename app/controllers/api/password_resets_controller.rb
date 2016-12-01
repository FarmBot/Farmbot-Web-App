module Api
  class PasswordResetsController < Api::AbstractController
    skip_before_action :authenticate_user!, only: [:create, :update]

    def create
      mutate PasswordResets::Create.run({})
    end

    def update
      mutate PasswordResets::Update.run({})
    end
  end
end
