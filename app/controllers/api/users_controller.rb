module Api
  class UsersController < Api::AbstractController
    skip_before_action :authenticate_user!, only: :create

    def create
      mutate Users::Create.run(user_params)
    end

    private

    def user_params
      user = params[:user] || params
      {email:                 user[:email],
       name:                  user[:name],
       password:              user[:password],
       password_confirmation: user[:password_confirmation]}
    end
  end
end
