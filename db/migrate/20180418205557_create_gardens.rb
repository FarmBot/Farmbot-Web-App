class CreateGardens < ActiveRecord::Migration[5.1]
  def change
    create_table :gardens do |t|
      t.string     :name,   null: false
      t.references :device, null: false
      t.timestamps
    end

    create_table :plant_templates do |t|
      t.references :garden, null: false
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
