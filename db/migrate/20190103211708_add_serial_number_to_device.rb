class AddSerialNumberToDevice < ActiveRecord::Migration[5.2]
  def change
    add_column :devices, :serial_number, :string, limit: 32
  end
end
