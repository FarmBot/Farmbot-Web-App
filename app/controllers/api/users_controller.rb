module Api
  class UsersController < Api::AbstractController
    skip_before_action :authenticate_user!, only: [:create, :verify]

    def create
      mutate Users::Create.run(user_params)
    end

    def update
      mutate Users::Update.run(user_params, user: current_user)
    end

    def destroy
      mutate Users::Destroy.run(user_params, user: current_user)
    end

    def verify
      mutate Users::Verify.run(token: params[:token])
    end

    private

    def user_params
      user = params
        .as_json
        .merge!(params.as_json["user"] || {})
        .deep_symbolize_keys

      {email:                     user[:email],
       name:                      user[:name],
       password:                  user[:password],
       password_confirmation:     user[:password_confirmation],
       new_password:              user[:new_password],
       new_password_confirmation: user[:new_password_confirmation]}
    end
  end
end
