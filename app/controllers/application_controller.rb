class ApplicationController < ActionController::Base
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session

  def current_device
    if @current_device
      @current_device
    else
      @current_device = (current_user.try(:device) || no_device)
      Device.current  = @current_device # Mutable state eww
      @current_device
    end
  end

  def current_device_id
    "device_#{current_device.try(:id) || 0}"
  end
end
