class CreateSavedGardens < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    create_table :saved_gardens do |t|
      t.string     :name,   null: false
      t.references :device, null: false
      t.timestamps
    end

    create_table :plant_templates do |t|
      t.references :saved_garden, null: false
      t.references :device, null: false
      t.float "radius", default: 25.0, null: false
      t.float "x", null: false
      t.float "y", null: false
      t.float "z", default: 0.0, null: false
      t.string "name", default: "untitled", null: false
      t.string "openfarm_slug", limit: 280, default: "null", null: false
    end
  end
end
