class AddWebcamUrlToDevices < ActiveRecord::Migration[4.2]
  def change
    add_column :devices, :webcam_url, :string
  end
end
