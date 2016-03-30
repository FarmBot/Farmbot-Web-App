module Devices
  class Create < Mutations::Command
    using MongoidRefinements

    required do
      model :user, class: User
      string :uuid
      string :token
    end

    optional do
      string :name, default: nil
    end

    def execute
      inputs["name"] ||= Haikunator.haikunate(99)
      dev = Device.find_or_initialize_by(uuid: uuid, token: token)
      if update_attributes(dev, inputs.except(:user))
        user.update_attributes(device: dev)
      end
      dev
    end
  end
end
