class CreateStepParams < ActiveRecord::Migration[4.2]
  def change
    create_table :step_params do |t|
      t.string :key
      t.string :value
      t.belongs_to :step, index: true, foreign_key: true
      remove_column :steps, :command, :text
    end
  end
end
