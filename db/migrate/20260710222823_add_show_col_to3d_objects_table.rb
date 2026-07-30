class AddShowColTo3dObjectsTable < ActiveRecord::Migration[8.1]
  def up
    add_column :scene_objects, :show, :boolean, default: true, null: false
    add_column :web_app_configs, :show_scene_objects, :boolean, default: true
  end

  def down
    remove_column :scene_objects, :show
    remove_column :web_app_configs, :show_scene_objects
  end
end
