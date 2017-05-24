class CreateEverything < ActiveRecord::Migration[4.1]
  def self.up
    execute """
    ALTER TABLE schedules
    ADD CONSTRAINT check_schedules_time_unit_naming
    CHECK (time_unit IN (minutely hourly daily weekly monthly yearly) )
    """

    execute """
    ALTER TABLE regimens
    ADD CONSTRAINT check_regimens_color_naming
    CHECK (color IN (blue green yellow orange purple pink gray red) )
    """
  end

  def self.down
    execute """
    ALTER TABLE schedules
    DROP CONSTRAINT check_schedules_time_unit_naming
    """

    execute """
    ALTER TABLE regimens
    DROP CONSTRAINT check_regimens_color_naming
    """
  end

  def change
    create_table :devices do |t|
      t.integer :planting_area_id
      t.string :uuid
      t.string :name
    end

    create_table :plants do |t|
      t.integer :device_id
      t.integer :planting_area_id
      t.string :name
      t.string :img_url
      t.string :icon_url
      t.string :openfarm_slug
      t.string :x
      t.string :y
      t.string :planted_at
    end

    create_table :planting_areas do |t|
      t.integer :width
      t.integer :length
      t.integer :device_id
    end

    create_table :regimens do |t|
      t.string :color
      t.string :name
      t.integer :device_id
    end

    create_table :regimen_items do |t|
      t.integer :time_offset
      t.integer :schedule_id
      t.integer :regimen_id
      t.integer :sequence_id
    end

    create_table :schedules do |t|
      t.integer :sequence_id
      t.integer :device_id
      t.datetime :start_time
      t.datetime :end_time
      t.datetime :next_time
      t.integer :repeat
      # minutely hourly daily weekly monthly yearly
      t.string :time_unit
    end

    create_table :sequences do |t|
      t.integer :schedule_id
      t.integer :device_id
      t.string :regimen
      t.string :name
      t.string :color
    end

    create_table :steps do |t|
      t.integer :sequence_id
      t.string :message_type
      t.integer :position
      t.text   :command
    end

    ### A single system User on the decision support system.
    create_table :users do |t|

      t.integer :device_id
      t.string :name

      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at
      t.integer  :sign_in_count, default: 0, null: false
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.string   :current_sign_in_ip
      t.string   :last_sign_in_ip
      t.timestamps null: false
    end
      add_index :users, :email,                unique: true
      add_index :users, :reset_password_token, unique: true

    end

end
