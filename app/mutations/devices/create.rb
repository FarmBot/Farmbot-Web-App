module Devices
  class Create < Mutations::Command
    using MongoidRefinements

    required do
      model :user, class: User
    end

    optional do
      string :uuid
      string :name
    end

    def execute
      merge_default_values

      ActiveRecord::Base.transaction do
        device.update_attributes!(inputs.except(:user))
        old_device = user.device
        user.update_attributes!(device_id: device.id)
        if device.users.count < 1
          old_device.destroy! # Clean up "orphan" devices.
        end
      end

      device
    end
  private
  
    def merge_default_values
      inputs[:uuid]  ||= SecureRandom.uuid 
      inputs[:name]  ||= Haikunator.haikunate(9999)
    end

    def device
      @device ||= Device.find_by(uuid: uuid) || Device.new(uuid: uuid)
    end
  end
end
