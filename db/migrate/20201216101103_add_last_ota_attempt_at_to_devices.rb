class AddLastOtaAttemptAtToDevices < ActiveRecord::Migration[6.0]
  def change
    add_column :devices, :last_ota_attempt_at, :datetime

    if Object.const_defined?("Device")
      puts "===== Setting `last_ota_attempt_at` to default value:"
      Device.update_all(last_ota_attempt_at: 35.years.ago)
    end
  end
end
