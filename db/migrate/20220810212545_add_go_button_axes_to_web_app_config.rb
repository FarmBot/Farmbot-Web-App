class AddGoButtonAxesToWebAppConfig < ActiveRecord::Migration[6.1]
  def up
    add_column :web_app_configs, :go_button_axes, :string, limit: 3, null: false, default: "XY"
  end

  def down
    remove_column :web_app_configs, :go_button_axes
  end
end
