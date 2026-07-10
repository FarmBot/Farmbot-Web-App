class CreateSceneObjects < ActiveRecord::Migration[8.1]
  def up
    create_table :scene_objects do |t|
      t.references :device, foreign_key: true
      t.string     :name, limit: 80, null: false
      t.string     :texture, limit: 80, null: false
      t.string     :shape, limit: 80, null: false
      t.string     :color, limit: 80, null: false
      t.string     :x_origin, limit: 80, null: false
      t.string     :y_origin, limit: 80, null: false
      t.string     :z_origin, limit: 80, null: false
      t.integer    :x_center, null: false
      t.integer    :y_center, null: false
      t.integer    :z_base, null: false
      t.integer    :x_size, null: false
      t.integer    :y_size, null: false
      t.integer    :z_size, null: false

      t.timestamps
    end
  end

  def down
    drop_table :scene_objects do |t|
      t.references :device, foreign_key: true
      t.string     :name, limit: 80, null: false
      t.string     :texture, limit: 80, null: false
      t.string     :shape, limit: 80, null: false
      t.string     :color, limit: 80, null: false
      t.string     :x_origin, limit: 80, null: false
      t.string     :y_origin, limit: 80, null: false
      t.string     :z_origin, limit: 80, null: false
      t.integer    :x_center, null: false
      t.integer    :y_center, null: false
      t.integer    :z_base, null: false
      t.integer    :x_size, null: false
      t.integer    :y_size, null: false
      t.integer    :z_size, null: false

      t.timestamps
    end
  end
end
