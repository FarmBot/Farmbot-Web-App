class AddNotesToSavedGardens < ActiveRecord::Migration[6.1]
  def change
    add_column :saved_gardens, :notes, :string, limit: 1500
  end
end
