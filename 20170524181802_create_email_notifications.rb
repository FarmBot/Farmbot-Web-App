# class CreateEmailNotifications < ActiveRecord::Migration[5.1]
#   def change
#     create_table :log_delivery_requests do |t|
#       t.datetime   :sent_at
#       t.references :log
#       t.references :device
#       t.timestamps
#     end

#     add_index :log_delivery_requests, :device_id
#     add_index :log_delivery_requests, :created_at
#   end
# end
