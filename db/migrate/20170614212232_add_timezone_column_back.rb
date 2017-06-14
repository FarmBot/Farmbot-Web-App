class AddTimezoneColumnBack < ActiveRecord::Migration[5.1]
  def change
	  add_column :devices, :timezone, :string
	  add_index :devices, :timezone
	end
end
