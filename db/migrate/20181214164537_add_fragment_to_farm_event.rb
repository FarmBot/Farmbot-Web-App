class AddFragmentToFarmEvent < ActiveRecord::Migration[5.2]
  def change
    add_reference :farm_events, :fragment, foreign_key: true
  end
end
