module Devices
  class Destroy < Mutations::Command
    required do
      model :user, class: User
      model :device, class: Device
    end

    def execute
      ActiveRecord::Base.transaction do
        user.update!(device: Devices::Create.run!(user: user))
        device.destroy! if device.reload.users.count < 1
      end
      true
    end
  end
end
