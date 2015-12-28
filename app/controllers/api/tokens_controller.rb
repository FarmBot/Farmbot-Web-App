module Api
  class TokensController < Api::AbstractController
    skip_before_action :authenticate_user!, only: :create

    def create
      mutate Auth::CreateToken.run(auth_params)
    end

    private

    def auth_params
      return { email:    params[:user][:email],
               password: params[:user][:password] }
    end
  end
end
