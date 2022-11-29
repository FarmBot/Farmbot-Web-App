module Api
  class TokensController < Api::AbstractController
    skip_before_action :authenticate_user!, only: :create
    skip_before_action :check_fbos_version, only: [:create, :show]
    before_action :clean_out_old_tokens

    CREDS = Auth::CreateTokenFromCredentials
    NO_CREDS = Auth::CreateToken
    NO_USER_ATTR = "API requests need a `user` attribute that is a JSON object."

    # Give you the same token, but reloads all claims except `exp`
    def show
      mutate Auth::ReloadToken
               .run(jwt: request.headers["Authorization"], fbos_version: fbos_version)
    end

    def create
      # Around June of 2020, we started getting Rails double
      # render errors on this endpoint when users would try
      # to log in with an unverified account (500 error).
      # Still not sure what changed or why, but this is a
      # temporary hotfix. Can be removed later if users
      # are able to attempt logins on unverified accounts.
      email = params.dig("user", "email")
      if needs_validation?(email)
        raise Errors::Forbidden, SessionToken::MUST_VERIFY
      end

      if_properly_formatted do |auth_params|
        klass = (auth_params[:credentials]) ? CREDS : NO_CREDS
        mutate klass
                 .run(auth_params)
                 .tap { |result| maybe_halt_login(result) }
                 .tap { |result| mark_as_seen(result.result[:user].device) if result.result }
      end
    end

    def destroy
      token = SessionToken.decode!(request.headers["Authorization"].split(" ").last)
      claims = token.unencoded
      device_id = claims["bot"].gsub("device_", "").to_i
      TokenIssuance
        .where("exp > ?", Time.now.to_i)
        .find_by!(jti: claims["jti"], device_id: device_id)
        .destroy!
    end

    private

    def needs_validation?(email)
      !User::SKIP_EMAIL_VALIDATION &&
      email &&
      User.find_by(email: email, confirmed_at: nil)
    end

    # Don't proceed with login if they need to sign the EULA
    def maybe_halt_login(result)
      result.result[:user].try(:require_consent!) if result.success?
    end

    def guess_aud_claim
      when_farmbot_os { return AbstractJwtToken::BOT_AUD }
      return AbstractJwtToken::HUMAN_AUD if xhr?
      AbstractJwtToken::UNKNOWN_AUD
    end

    def xhr? # I only wrote this because `request.xhr?` refused to be stubbed
      request.xhr?
    end

    # Every time a token is created, sweep the old TokenIssuances out of the
    # database.
    def clean_out_old_tokens
      CleanOutOldDbItemsJob.perform_later if TokenIssuance.any_expired?
    end

    def if_properly_formatted
      user = raw_json.fetch(:user, {})
      # If data handling for this method gets any more complicated,
      # extract into a mutation.
      if (user.is_a?(Hash))
        yield({ email: (user[:email] || "").downcase,
                password: user[:password],
                credentials: user[:credentials],
                agree_to_terms: !!user[:agree_to_terms],
                host: $API_URL,
                aud: guess_aud_claim,
                fbos_version: fbos_version })
      else
        render json: { error: NO_USER_ATTR }, status: 422
      end
    end
  end
end
