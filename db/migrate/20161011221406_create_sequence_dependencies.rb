class CreateSequenceDependencies < ActiveRecord::Migration[4.2]
  def change
    create_table :sequence_dependencies do |t|
      t.references :dependency, polymorphic: true
      t.references :sequence
    end

    add_index :sequence_dependencies, :dependency_id
    add_index :sequence_dependencies, :dependency_type
    add_index :sequence_dependencies, :sequence_id
  end
end
