module Devices
  class Create < Mutations::Command
    required do
      model :user, class: User
    end

    optional do
      string :timezone
      string :name
      string :webcam_url
    end

    def execute
      merge_default_values
      device = Device.create!({name: "Farmbot"}.merge(inputs.except(:user)))
      ActiveRecord::Base.transaction do
        old_device = user.device
        user.update_attributes!(device_id: device.id) # Detach from old one.
        # Remove userless devices.
        old_device.destroy! if old_device && device.users.count < 1
      end
      device
    end
  private

    def merge_default_values
      inputs[:name]  ||= "Farmbot"
    end
  end
end
