class RemoveArgsAndBodyFromSequence < ActiveRecord::Migration[5.1]
  def change
    remove_column :sequences, :args, :text
    remove_column :sequences, :body, :text
  end
end
