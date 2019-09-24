class RenameDeviceLastOtaChecktoLastOtaCheckup < ActiveRecord::Migration[5.2]
  safety_assured

  def change
    rename_column :devices, :last_ota_check, :last_ota_checkup
  end
end
