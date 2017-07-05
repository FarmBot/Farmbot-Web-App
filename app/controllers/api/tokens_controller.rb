module Api
  class TokensController < Api::AbstractController
    skip_before_action :authenticate_user!, only: :create
    skip_before_action :check_fbos_version, only: :create
    CREDS    = Auth::CreateTokenFromCredentials
    NO_CREDS = Auth::CreateToken

    def create
      klass = (auth_params[:credentials]) ? CREDS : NO_CREDS
      mutate klass.run(auth_params).tap{ |result| maybe_halt_login(result) }
    end

    private
    # Dont proceed with login if they need to sign the EULA
    def maybe_halt_login(result)
      result.result[:user].try(:require_consent!) if result.success?
    end

    def auth_params
      user = params.as_json.deep_symbolize_keys.fetch(:user, {})

      { email:          user.fetch(:email, "").downcase,
        password:       user[:password],
        credentials:    user[:credentials],
        agree_to_terms: !!user[:agree_to_terms],
        host:           $API_URL }
    end
  end
end
