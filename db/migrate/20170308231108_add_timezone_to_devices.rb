class AddTimezoneToDevices < ActiveRecord::Migration[5.0]
  def change
    add_column :devices, :timezone, :string
    add_index :devices, :timezone
  end
end
