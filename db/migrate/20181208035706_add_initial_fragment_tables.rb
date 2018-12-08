class AddInitialFragmentTables < ActiveRecord::Migration[5.2]
  def change
    # A tree of CeleryScript. Could be attached to a FarmEvent, Sequence, Etc...
    create_table :fragments do |t|
      t.references :device
    end

    # A constant declaration. Ex: if the node references `tool_id: 6`, then you need a primitive with a value of 6.
    create_table :primitives do |t|
      t.references :fragment
      t.string     :value
    end

    # If `node.args` in celery script contains key/value pairs, this is a key name.
    create_table :arg_names do |t|
      t.string :value
    end

    # The `node.kind` for a CS node. "sequence", "move_rel", etc...
    create_table :kinds do |t|
      t.string :value
    end

    # A node, linked to its neighboring node + kind + all that good stuff.
    create_table :nodes do |t|
      t.references :body,   foreign_key: { to_table: :nodes }
      t.references :fragment
      t.references :kind
      t.references :next,   foreign_key: { to_table: :nodes }
      t.references :parent, foreign_key: { to_table: :nodes }
    end

    # A collection of key/value pairs.
    create_table :arg_sets do |t|
      t.references :fragment
      t.references :node
    end

    # K/V Pairs that are not CeleryScript nodes. Eg: `tool_id: 6`
    create_table :primitive_pairs do |t|
      t.references :fragment
      t.references :arg_name
      t.references :arg_set
      t.references :primitive
    end

    # A key/value pair that nests deeper in the tree. Ex: `location` arg in
    # `move_abs`
    create_table :standard_pairs do |t|
      t.references :fragment
      t.references :arg_name
      t.references :arg_set
      t.references :node
    end
  end
end
