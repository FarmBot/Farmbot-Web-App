class AddShowImagesToWebAppConfigs < ActiveRecord::Migration[5.1]
  def change
    add_column  :web_app_configs,
                :show_images,
                :boolean,
                default: false
  end
end
