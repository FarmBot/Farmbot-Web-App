class RemoveUuidFromDevice < ActiveRecord::Migration[4.1]
  def change
    remove_column :devices, :uuid, :integer
  end
end
