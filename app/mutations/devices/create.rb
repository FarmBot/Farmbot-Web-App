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
      inputs["name"] ||= Haikunator.haikunate(9999)
      dev = Device.find_or_initialize_by(uuid: uuid)

      ActiveRecord::Base.transaction do
        dev.update_attributes!(inputs.except(:user))
        user.update_attributes!(device_id: dev.id)
      end

      dev
    end
  end
end
