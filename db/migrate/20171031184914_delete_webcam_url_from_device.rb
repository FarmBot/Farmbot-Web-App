class DeleteWebcamUrlFromDevice < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    remove_column :devices, :webcam_url
  end
end
