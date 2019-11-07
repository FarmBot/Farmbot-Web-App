class CreateWebcamFeeds < ActiveRecord::Migration[5.1]

  def change
    create_table :webcam_feeds do |t|
      t.references :device
      t.string     :url

      t.timestamps
    end
  end
end
