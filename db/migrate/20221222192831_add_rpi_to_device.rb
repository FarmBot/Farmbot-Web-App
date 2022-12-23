class AddRpiToDevice < ActiveRecord::Migration[6.1]
  def up
    add_column :devices, :rpi, :string, limit: 3
  end

  def down
    remove_column :devices, :rpi
  end
end
