class NeedMoarIntegrity < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_foreign_key :points, :tools, null: true
  end
end
