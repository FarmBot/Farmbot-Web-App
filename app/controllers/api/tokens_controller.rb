module Api
  class TokensController < Api::AbstractController
    skip_before_action :authenticate_user!, only: :create

    def create
      if(auth_params[:credentials])
        mutate Auth::CreateTokenFromCredentials.run(auth_params)
      else
        mutate Auth::CreateToken.run(auth_params)
      end
    end

    private

    def auth_params
      params[:user] ||= {}

      { email:       params[:user][:email],
        password:    params[:user][:password],
        credentials: params[:user][:credentials],
        host:        $API_URL }
    end
  end
end
