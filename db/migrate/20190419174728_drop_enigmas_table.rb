class DropEnigmasTable < ActiveRecord::Migration[5.2]
  def change
    drop_table :enigmas
  end
end
