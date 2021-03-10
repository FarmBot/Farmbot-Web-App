class AddSetupCompletedAtToDevices < ActiveRecord::Migration[6.1]
  def change
    add_column :devices, :setup_completed_at, :datetime

    change_column_default(:web_app_configs, :show_weeds, from: false, to: true)
    change_column_default(:web_app_configs, :show_images, from: false, to: true)
  end
end
