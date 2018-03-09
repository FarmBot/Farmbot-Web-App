class UpdateDevicesAndPeripherals < ActiveRecord::Migration[5.1]
  def change
    add_column :devices, :fbos_version, :string, limit: 15 # "99.99.99-rc99"
    add_column :peripherals, :mode, :integer
  end
end
