class BeginTurnKeySequenceFeature < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key :fbos_configs, :sequences, column: :boot_sequence_id

    add_column :devices, :last_ota, :datetime
    add_column :devices, :last_ota_check, :datetime
  end
end
