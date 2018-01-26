class NewSequenceSchema < ActiveRecord::Migration[5.1]
  def change
    create_table :sequence_nodes do |t|
      t.timestamps null: false
      t.references  :sequence, index: true, null: false
      t.references  :parent,   index: true, null: true
      t.references  :child,    index: true, null: true
      t.string      :kind, limit: 50 # Longest CS Node kind: 28 characters.
    end

    create_table :sequence_leafs do |t|
      t.timestamps null: false
      t.references :sequence, index: true, null: false
      t.references :node,     index: true, null: false
      t.string     :kind,     limit: 50  # Longest CS Node kind: 28 characters.
      t.string     :key,      limit: 50  # Longest CS Node kind: 28 characters.
      t.string     :value,    limit: 300 # Serialized String, Integer or Boolean
    end
  end
end
