class AddNew3dViewOptionsToWebAppConfig < ActiveRecord::Migration[8.1]
  def up
    add_column :web_app_configs, :top_down_view, :boolean, default: false
    add_column :web_app_configs, :viewpoint_heading, :integer, default: 0
  end

  def down
    remove_column :web_app_configs, :top_down_view
    remove_column :web_app_configs, :viewpoint_heading
  end
end
