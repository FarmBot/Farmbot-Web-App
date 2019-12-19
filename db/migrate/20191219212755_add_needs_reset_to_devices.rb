class AddNeedsResetToDevices < ActiveRecord::Migration[6.0]
  def change
    add_column :devices,
               :needs_reset,
               :boolean,
               default: false
  end
end
