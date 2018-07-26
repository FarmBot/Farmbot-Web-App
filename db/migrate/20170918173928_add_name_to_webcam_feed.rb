class AddNameToWebcamFeed < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column :webcam_feeds,
               :name,
               :string,
               limit: 80,
               default: "Webcam Feed",
               presence: true
  end
end
