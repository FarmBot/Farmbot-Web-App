class CreateEnigmas < ActiveRecord::Migration[5.2]
  def change
    create_table :enigmas do |t|
      t.string :problem_tag, null: false
      t.integer :priority, default: 100, null: false
      t.string :uuid, null: false
      t.references :device, foreign_key: true, null: false
      t.timestamps
    end
  end
end
