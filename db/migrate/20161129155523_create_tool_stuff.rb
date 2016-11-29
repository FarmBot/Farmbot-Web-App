class CreateToolStuff < ActiveRecord::Migration[5.0]
  def change
    create_table :tool_bays do |t|
      t.references :device, foreign_key: true
      t.string :name
      t.timestamps
    end

    create_table :tool_slots do |t|
      t.references :tool_bay, foreign_key: true
      t.string :name
      t.integer :x
      t.integer :y
      t.integer :z
      t.timestamps
    end

    create_table :tools do |t|
      t.references :tool_slot, foreign_key: true
      t.string :name
      t.timestamps
    end
  end
end
