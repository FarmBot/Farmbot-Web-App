class AddPackageToFarmwareInstallation < ActiveRecord::Migration[5.2]
  def change
    add_column :farmware_installations,
               :package,
               :string,
               limit: 80
    add_column :farmware_installations,
               :package_error,
               :string
  end
end
