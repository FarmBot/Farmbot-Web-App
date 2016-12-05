class AddDeviceIdToTools < ActiveRecord::Migration[5.0]
  def change
    add_reference :tools, :device, index: true
  end
end
