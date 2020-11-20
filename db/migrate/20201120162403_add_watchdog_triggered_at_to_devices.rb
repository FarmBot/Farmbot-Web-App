class AddWatchdogTriggeredAtToDevices < ActiveRecord::Migration[6.0]
  def change
    add_column :devices, :last_watchdog, :datetime
    remove_column :devices, :needs_reset, :boolean # Not used
    remove_column :devices, :last_saw_mq, :datetime # 0 production use

    if Object.const_defined?("Device")
      # Prevent a wave of watchdog alerts after first
      # deployment.
      puts "===== Setting `last_watchdog` to default value:"
      Device.update_all(last_watchdog: Time.now)
    end
  end
end
