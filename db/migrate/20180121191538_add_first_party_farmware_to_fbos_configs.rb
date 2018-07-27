class AddFirstPartyFarmwareToFbosConfigs < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column  :web_app_configs,
                :show_first_party_farmware,
                :boolean,
                default: false
  end
end
