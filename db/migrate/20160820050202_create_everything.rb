class CreateEverything < ActiveRecord::Migration
  def change
    create_table :devices do |t|
      t.string :planting_area_id
      t.string :uuid
      t.string :token
      t.string :name
    end

    create_table :plants do |t|
      t.string :device_id
      t.string :planting_area_id
      t.string :name
      t.string :img_url
      t.string :icon_url
      t.string :openfarm_slug
      t.string :x
      t.string :y
      t.string :planted_at
    end

    create_table :planting_areas do |t|
      t.string :width
      t.string :length
      t.string :device_id
    end


    create_table :regimens do |t|
      t.string :color
      t.string :name
      t.string :device_id
    end

    create_table :regimen_items do |t|
      t.string :time_offset
      t.string :schedule_id
      t.string :regimen_id
      t.string :sequence_id
    end

    create_table :schedules do |t|
      t.string :sequence_id
      t.string :device_id
      t.string :start_time
      t.string :end_time
      t.string :next_time
      t.string :repeat
      t.string :time_unit
    end

    create_table :sequences do |t|
      t.string :schedule_id
      t.string :device_id
      t.string :regimen
      t.string :name
      t.string :color
    end

    create_table :steps do |t|
      t.string :sequence_id
      t.string :message_type
      t.string :position
    end

    create_table :commands do |t|
      # Was embedded
      # key?
      # value?
      t.string :step_id
    end

    ### A single system User on the decision support system.
    create_table :users do |t|

      t.string :device_id
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
end
