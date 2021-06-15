class AddPatchVersionToLogs < ActiveRecord::Migration[6.1]
  def change
    add_column :logs, :patch_version, :integer
  end
end
