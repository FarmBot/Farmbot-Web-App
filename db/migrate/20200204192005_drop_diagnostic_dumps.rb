class DropDiagnosticDumps < ActiveRecord::Migration[6.0]
  def change
    drop_table :diagnostic_dumps do |t|
      t.references :device, foreign_key: true, null: false
      t.string :fbos_commit, null: false
      t.string :fbos_version, null: false
      t.string :firmware_commit, null: false
      t.string :firmware_hardware, limit: 12
      t.string :firmware_state, null: false
      t.string :firmware_version, limit: 12
      t.string :network_interface, null: false
      t.string :soc_temp, limit: 12
      t.string :sync_status, limit: 12
      t.string :ticket_identifier, null: false, unique: true
      t.string :wifi_level, limit: 12
      t.text   :fbos_dmesg_dump, null: false
      t.timestamps
    end
  end
end
