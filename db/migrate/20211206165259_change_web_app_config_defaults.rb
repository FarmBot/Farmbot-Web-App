class ChangeWebAppConfigDefaults < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:web_app_configs, :display_trail, true)
    change_column_default(:web_app_configs, :show_camera_view_area, true)
    change_column_default(:web_app_configs, :crop_images, true)
  end
end
