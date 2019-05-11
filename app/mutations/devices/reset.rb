module Devices
  class Reset < Mutations::Command
    include Users::PasswordHelpers

    required do
      model :device
      string :password
    end

    def validate
      confirm_password(user, password)
    end

    def execute
      self.delay.run_it
      { ok: "OK" }
    end

    private

    def run_it
      ActiveRecord::Base.transaction do
        device.update_attributes!(name: "FarmBot")
        Device::SINGULAR_RESOURCES.keys.map do |resource|
          device.send(resource).destroy!
        end

        Device::PLURAL_RESOURCES.without(:token_issuances).map do |resources|
          device.send(resources).destroy_all
        end

        Alerts::Create.run!(Alert::SEED_DATA.merge(device: device))
      end
    end

    def user
      @user ||= User.find_by!(device: device)
    end
  end
end
