class DeleteWebcamUrlFromDevice < ActiveRecord::Migration[5.1]

  def change
    remove_column :devices, :webcam_url
  end
end
