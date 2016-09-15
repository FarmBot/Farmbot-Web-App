module Devices
  class Create < Mutations::Command
    using MongoidRefinements

    required do
      model :user, class: User
    end

    optional do
      string :uuid
      string :name
      string :webcam_url
    end

    def execute
      merge_default_values
      device = Device.new(inputs.except(:user))
      ActiveRecord::Base.transaction do
        old_device = user.device                      # Ref. to old device
        device.save!                                  # Create the new one.
        user.update_attributes!(device_id: device.id) # Detach from old one.
        # Remove userless devices.
        old_device.destroy! if old_device && device.users.count < 1
      end

      device
    end
  private
  
    def merge_default_values
      inputs[:uuid]  ||= SecureRandom.uuid 
      inputs[:name]  ||= Haikunator.haikunate(9999)
    end
  end
end
