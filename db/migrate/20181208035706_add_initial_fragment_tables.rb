class AddInitialFragmentTables < ActiveRecord::Migration[5.2]
  def change
    # A tree of CeleryScript. Could be attached to a FarmEvent, Sequence, Etc...
    create_table :fragments do |t|
      t.timestamps
      t.references :device
    end

    # A constant declaration. Ex: if the node references `tool_id: 6`, then you need a primitive with a value of 6.
    create_table :primitives do |t|
      t.references :fragment, null: false
      t.string     :value, null: false
    end

    # If `node.args` in celery script contains key/value pairs, this is a key name.
    create_table :arg_names do |t|
      t.string :value, null: false, unique: true
    end

    # The `node.kind` for a CS node. "sequence", "move_rel", etc...
    create_table :kinds do |t|
      t.string :value, null: false, unique: true
    end

    # A node, linked to its neighboring node + kind + all that good stuff.
    create_table :nodes do |t|
      t.references :fragment, null: false
      t.references :kind,     null: false
      t.references :caller,   polymorphic: true
      t.integer    :body_id
      t.integer    :next_id
      t.integer    :parent_id
    end

    # A collection of key/value pairs.
    create_table :arg_sets do |t|
      t.references :fragment, null: false
      t.references :node,     null: false
    end

    # K/V Pairs that are not CeleryScript nodes. Eg: `tool_id: 6`
    create_table :primitive_pairs do |t|
      t.references :fragment,  null: false
      t.references :arg_name,  null: false
      t.references :arg_set,   null: false
      t.references :primitive, null: false
    end

    # A key/value pair that nests deeper in the tree. Ex: `location` arg in
    # `move_abs`
    create_table :standard_pairs do |t|
      t.references :fragment, null: false
      t.references :arg_name, null: false
      t.references :arg_set,  null: false
      t.references :node,     null: false
    end
  end
end
