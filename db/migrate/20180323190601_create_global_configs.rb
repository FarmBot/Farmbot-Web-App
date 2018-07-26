class CreateGlobalConfigs < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    create_table :global_configs do |t|
      t.string :key
      t.text :value

      t.timestamps
    end
  end
end
