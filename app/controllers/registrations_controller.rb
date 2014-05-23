# Because of strong parameters in Rails 4 and the fact that our Devise
# registration form has non-standard user fields (User#name), we need to
# override the Devise::RegistrationsController. If we didn't do this, we would
# not be able to save fields such as 'name' when a user registers for the site.
class RegistrationsController < Devise::RegistrationsController
  before_filter :update_sanitized_params, if: :devise_controller?

  #See: http://stackoverflow.com/questions/17384289
  #     /unpermitted-parameters-adding-new-fields-to-devise-in-rails-4-0
  def update_sanitized_params
    devise_parameter_sanitizer.for(:sign_up) do |user|
      user.permit(:name, :email, :password, :password_confirmation)
    end

    devise_parameter_sanitizer.for(:account_update) do |user|
      user.permit(:name,
                  :email,
                  :password,
                  :password_confirmation,
                  :current_password)
    end
  end

end