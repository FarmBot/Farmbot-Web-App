class ApplicationController < ActionController::Base
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session
  after_action :unset_current_device

  # [MM] app/controllers/application_controller.rb
  before_action :set_mime_types

  def set_mime_types
    if request.path.include?('.css')
      headers['Content-Type'] = 'text/css'
    elsif request.path.include?('.js')
      headers['Content-Type'] = 'application/javascript'
    end
  end

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
