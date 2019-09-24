class BeginBootSequenceFeature < ActiveRecord::Migration[5.2]
  def change
    add_column :fbos_configs, :boot_sequence_id, :integer
    add_column :devices, :last_ota, :datetime
    add_column :devices, :last_ota_check, :datetime
  end
end
