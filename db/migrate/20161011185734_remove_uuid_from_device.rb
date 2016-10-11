class RemoveUuidFromDevice < ActiveRecord::Migration
  def change
    remove_column :devices, :uuid, :integer
  end
end
