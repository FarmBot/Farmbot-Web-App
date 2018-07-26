class RemoveArgsAndBodyFromSequence < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    remove_column :sequences, :args, :text
    remove_column :sequences, :body, :text
  end
end
