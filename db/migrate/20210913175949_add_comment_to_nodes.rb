class AddCommentToNodes < ActiveRecord::Migration[5.1]
  def change
    add_column :nodes, :comment, :string
  end
end
