class AddNonNullConstraintToUsersDeviceId < ActiveRecord::Migration[6.0]
  def change
    change_column_null :users, :device_id, false
  end
end
