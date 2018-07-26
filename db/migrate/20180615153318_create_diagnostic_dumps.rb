class CreateDiagnosticDumps < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    create_table :diagnostic_dumps do |t|
      t.references :device, foreign_key: true, null: false
      t.string     :ticket_identifier,         null: false, unique: true
      t.string     :fbos_commit,               null: false
      t.string     :fbos_version,              null: false
      t.string     :firmware_commit,           null: false
      t.string     :firmware_state,            null: false
      t.string     :network_interface,         null: false
      t.text       :fbos_dmesg_dump,           null: false
      t.timestamps

    end
  end
end
