class RemoveUuidFromDevice < ActiveRecord::Migration[4.2]
  def change
    remove_column :devices, :uuid, :integer
  end
end
