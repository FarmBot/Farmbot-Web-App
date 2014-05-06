# Because of strong parameters in Rails 4 and the fact that our Devise
# registration form has non-standard user fields (User#name), we need to
# override the Devise::RegistrationsController
class RegistrationsController < Devise::RegistrationsController
  before_filter :update_sanitized_params, if: :devise_controller?

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