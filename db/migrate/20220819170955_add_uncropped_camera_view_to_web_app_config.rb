class AddUncroppedCameraViewToWebAppConfig < ActiveRecord::Migration[6.1]
  def up
    add_column :web_app_configs, :show_uncropped_camera_view_area, :boolean, default: false
  end

  def down
    remove_column :web_app_configs, :show_uncropped_camera_view_area
  end
end
