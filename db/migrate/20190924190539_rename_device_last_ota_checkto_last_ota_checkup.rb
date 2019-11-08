class RenameDeviceLastOtaChecktoLastOtaCheckup < ActiveRecord::Migration[5.2]


  def change
    rename_column :devices, :last_ota_check, :last_ota_checkup
  end
end
