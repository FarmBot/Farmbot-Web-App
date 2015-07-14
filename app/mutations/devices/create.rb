module Devices
  class Create < Mutations::Command
    using MongoidRefinements

    required do
      model :user, class: User
    end

    optional do
      string :name, default: 'Not set.'
      string :uuid, default: 'Not set.'
      string :token, default: 'Not set.'
    end

    def execute
      create Device, inputs.except(:user) do |dev|
        user.update_attributes(device: dev)
      end
    end
  end
end
