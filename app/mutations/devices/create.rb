module Devices
  class Create < Mutations::Command
    required do
      model :user, class: User, new_records: true
    end

    optional do
      string :timezone
      string :name
      string :webcam_url
    end

    def execute
      merge_default_values
      device = Device.create!({name: "Farmbot"}.merge(inputs.except(:user)))
      Alerts::Create.run!(device:      device,
                           problem_tag: Alert::SEED_DATA)
      Alerts::Create.run!(device:      device,
                           problem_tag: Alert::TOUR)
      Alerts::Create.run!(device:      device,
                           problem_tag: Alert::USER)
      Alerts::Create.run!(device:      device,
                           problem_tag: Alert::DOCUMENTATION)

      ActiveRecord::Base.transaction do
        # TODO: This is a really, really, really old
        # no-longer-relevant legacy features back
        # when we were using MongoDB. This can be
        # safely removed now. - RC 11-APR-19
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
