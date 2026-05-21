class ApplicationController < ActionController::Base
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session
  # class static initialization block support
  allow_browser versions: {
    chrome: 94,
    firefox: 93,
    edge: 94,
    ie: false
  }

  after_action :unset_current_device

  def unset_current_device
    Device.send(:current=, nil)
  end

  def current_device
    return @current_device if @current_device

    authenticate_user! unless current_user
    @current_device = current_user.device
    Device.send(:current=, @current_device)
    @current_device
  end

  def current_device_id
    "device_#{current_device.try(:id) || 0}"
  end
end
