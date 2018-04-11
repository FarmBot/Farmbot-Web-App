class UpdateInUseToolsToVersion2 < ActiveRecord::Migration[5.1]
  def change
    update_view :in_use_tools, version: 2, revert_to_version: 1
  end
end
