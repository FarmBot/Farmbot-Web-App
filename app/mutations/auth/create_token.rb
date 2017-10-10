module Auth
  class CreateToken < Mutations::Command
    include Auth::ConsentHelpers
    include Skylight::Helpers

    required do
      string :email
      string :password
    end

    optional do
      boolean :agree_to_terms
      string :aud,
        in: AbstractJwtToken::ALLOWED_AUD,
        default: AbstractJwtToken::UNKNOWN_AUD
    end

    instrument_method
    def validate
      @user = User.where(email: email.downcase).first
      whoops! unless @user && @user.valid_password?(password)
      if @user && @user.must_consent? && !agree_to_terms && @user.valid_password?(password)
        @user.require_consent!
      end
    end

    instrument_method
    def execute
      @user.update_attributes(agreed_to_terms_at: Time.now) if agree_to_terms
      SessionToken.as_json(@user, aud)
    end

    private

    instrument_method
    def whoops!
      add_error :auth, :*, "Bad email or password."
    end
  end
end
