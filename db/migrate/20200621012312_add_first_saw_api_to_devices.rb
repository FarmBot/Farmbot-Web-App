class AddFirstSawApiToDevices < ActiveRecord::Migration[6.0]
  def change
    add_column :devices, :first_saw_api, :datetime
  end
end
