class AddClipImageLayerToWebAppConfig < ActiveRecord::Migration[6.1]
  def change
    add_column :web_app_configs, :clip_image_layer, :boolean, default: true
  end
end
