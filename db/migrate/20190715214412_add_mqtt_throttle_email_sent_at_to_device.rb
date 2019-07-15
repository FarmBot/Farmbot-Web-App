class AddMqttThrottleEmailSentAtToDevice < ActiveRecord::Migration[5.2]
  def change
    add_column :devices,
               :mqtt_rate_limit_email_sent_at,
               :datetime
  end
end
