class AddWizardTables < ActiveRecord::Migration[6.1]
  def change
    create_table :wizard_step_results do |t|
      t.timestamps
      t.references :device, foreign_key: true, null: false
      t.string     :slug, null: false
      t.boolean    :answer
      t.string     :outcome
    end

    add_column :devices, :fb_order_number, :string
  end
end
