class AddFirstSawApiToDevices < ActiveRecord::Migration[6.0]
  def change
    # RUN THIS:
    # Device.update_all(first_saw_api: 10.years.ago)
    add_column :devices, :first_saw_api, :datetime
  end
end
