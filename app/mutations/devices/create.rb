module Devices
  class Create < Mutations::Command
    using MongoidRefinements

    required do
      model :user, class: User
    end

    optional do
      string :uuid
      string :token
      string :name
    end

    def execute
      merge_default_values

      device.update_attributes(inputs.except(:user))
      user.update_attributes(device_id: device.id)

      device
    end
  private
  
    def merge_default_values
      inputs[:uuid]  ||= SecureRandom.uuid 
      inputs[:token] ||= SecureRandom.hex
      inputs[:name]  ||= Haikunator.haikunate(9999)
    end

    def device
      @device ||= Device.find_by(uuid: uuid) || Device.new(uuid: uuid)
    end
  end
end
