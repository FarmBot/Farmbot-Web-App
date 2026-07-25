class AddRotationColToSceneObjectsTable < ActiveRecord::Migration[8.1]
  def up
    add_column :scene_objects, :rotation, :integer, default: 0, null: false
  end

  def down
    remove_column :scene_objects, :rotation
  end
end
