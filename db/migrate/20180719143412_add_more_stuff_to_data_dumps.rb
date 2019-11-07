class AddMoreStuffToDataDumps < ActiveRecord::Migration[5.2]

  def change
    add_column :diagnostic_dumps, :sync_status,       :string, limit: 12
    add_column :diagnostic_dumps, :wifi_level,        :string, limit: 12
    add_column :diagnostic_dumps, :soc_temp,          :string, limit: 12
    add_column :diagnostic_dumps, :firmware_hardware, :string, limit: 12
    add_column :diagnostic_dumps, :firmware_version,  :string, limit: 12
  end
end
