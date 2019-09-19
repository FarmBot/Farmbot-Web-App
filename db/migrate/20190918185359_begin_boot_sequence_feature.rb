class BeginBootSequenceFeature < ActiveRecord::Migration[5.2]
  def change
    add_reference :fbos_configs, :boot_sequence, foreign_key: { to_table: :sequences }
    add_column :devices, :last_ota, :datetime
    add_column :devices, :last_ota_check, :datetime
  end
end
