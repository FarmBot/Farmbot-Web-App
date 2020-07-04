class AddCropImagesToWebAppConfig < ActiveRecord::Migration[6.0]
  def change
    add_column :web_app_configs, :crop_images, :boolean, default: false
    add_column :web_app_configs, :show_camera_view_area, :boolean, default: false
  end
end
