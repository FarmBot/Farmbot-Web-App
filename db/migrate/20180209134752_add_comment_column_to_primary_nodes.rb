class AddCommentColumnToPrimaryNodes < ActiveRecord::Migration[5.1]
  def change
    add_column :primary_nodes,
               :comment,
               :string,
               limit: 80
  end
end
