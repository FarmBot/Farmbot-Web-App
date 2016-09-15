class AddWebcamUrlToDevices < ActiveRecord::Migration
  def change
    add_column :devices, :webcam_url, :string
  end
end
