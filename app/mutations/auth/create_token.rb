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
      maybe_validate_tos if @user && @user.must_consent?
    end

    def execute
      SessionToken.as_json(@user)
    end

    private

    def whoops!
      add_error :auth, :*, "Bad email or password."
    end
  end
end
