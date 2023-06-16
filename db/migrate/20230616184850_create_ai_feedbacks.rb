class CreateAiFeedbacks < ActiveRecord::Migration[6.1]
  def up
    create_table :ai_feedbacks do |t|
      t.references :device, foreign_key: true
      t.string :prompt, limit: 500
      t.string :reaction, limit: 25

      t.timestamps
    end
  end

  def down
    drop_table :ai_feedbacks do |t|
      t.references :device, foreign_key: true
      t.string :prompt, limit: 500
      t.string :reaction, limit: 25

      t.timestamps
    end
  end
end
