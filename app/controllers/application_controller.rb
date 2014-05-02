class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # An overridable method for redirecting a new user to a particular page after
  # registration
  def after_sign_up_path_for(resource)
    #doesn't seem to get called when Confirmable is active.
    'dashboard/index.html'
  end
end
