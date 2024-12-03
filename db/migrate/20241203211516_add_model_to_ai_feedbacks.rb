class AddModelToAiFeedbacks < ActiveRecord::Migration[6.1]
  def up
    add_column :ai_feedbacks, :model, :string, limit: 30
    add_column :ai_feedbacks, :temperature, :string, limit: 5
  end

  def down
    remove_column :ai_feedbacks, :model
    remove_column :ai_feedbacks, :temperature
  end
end
