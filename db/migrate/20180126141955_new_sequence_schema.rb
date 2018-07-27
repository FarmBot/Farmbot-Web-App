class NewSequenceSchema < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    create_table :primary_nodes do |t|
      t.timestamps null: false
      t.references  :sequence, index: true, null: false
      t.string      :kind,     limit: 50
      t.references  :child,    index: true, null: true
      t.references  :parent,   index: true, null: true
      t.string      :parent_arg_name, limit: 50
      # 👆 Longest CS Node kind: 28 characters. 50 is plenty. -RC
    end

    create_table :edge_nodes do |t|
      t.timestamps null: false
      t.references :sequence,     index: true, null: false
      t.references :primary_node, index: true, null: false
      # Longest CS Node kind: 28 characters.
      t.string     :kind,         limit: 50
      # Serialized String, Integer or Boolean.
      t.string     :value,        limit: 300
    end

    add_foreign_key :edge_nodes,    :sequences
    add_foreign_key :primary_nodes, :sequences
  end
end
