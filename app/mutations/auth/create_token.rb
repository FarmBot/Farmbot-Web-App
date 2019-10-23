module Auth
  class CreateToken < Mutations::Command
    include Auth::ConsentHelpers

    required do
      string :email
      string :password
      model  :fbos_version, class: Gem::Version
    end

    optional do
      boolean :agree_to_terms
      string :aud,
        in: AbstractJwtToken::ALLOWED_AUD,
        default: AbstractJwtToken::UNKNOWN_AUD
    end

    def validate
      @user = User.where(email: email.downcase).first
      whoops! unless @user && @user.valid_password?(password)
      must_consent = @user &&
                     @user.must_consent? &&
                     !agree_to_terms &&
                     @user.valid_password?(password)
      @user.require_consent! if must_consent
    end

    def execute
      @user.update(agreed_to_terms_at: Time.now) if agree_to_terms
      SessionToken.as_json(@user, aud, fbos_version)
    end

    private

    def whoops!
      add_error :auth, :*, "Bad email or password."
    end
  end
end
