class AddShowControlsOverlayToWebAppConfig < ActiveRecord::Migration[8.1]
  def up
    add_column :web_app_configs, :show_controls_overlay, :boolean, default: true
  end

  def down
    remove_column :web_app_configs, :show_controls_overlay
  end
end
