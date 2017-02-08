module Auth
  class CreateToken < Mutations::Command
    include Auth::ConsentHelpers

    required do
      string :email
      string :password
    end

    optional do
      boolean :agree_to_terms
    end

    def validate
      @user = User.where(email: email.downcase).first
      whoops! unless @user && @user.valid_password?(password)
      @user.require_consent! if @user && @user.must_consent? && !agree_to_terms
    end

    def execute
      @user.update_attributes(agreed_to_terms_at: Time.now) if agree_to_terms
      SessionToken.as_json(@user)
    end

    private

    def whoops!
      add_error :auth, :*, "Bad email or password."
    end
  end
end
