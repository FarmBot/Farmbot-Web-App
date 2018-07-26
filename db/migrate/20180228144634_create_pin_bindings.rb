class CreatePinBindings < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    create_table :pin_bindings do |t|
      t.references :device, foreign_key: true
      t.integer :pin_num
      t.references :sequence, foreign_key: true

      t.timestamps
    end
  end
end
