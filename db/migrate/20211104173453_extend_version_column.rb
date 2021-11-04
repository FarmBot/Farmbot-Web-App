class ExtendVersionColumn < ActiveRecord::Migration[6.1]
  def change
    # "99.99.99.pre.RC99"
    change_column :devices, :fbos_version, :string, limit: 17
  end
end
