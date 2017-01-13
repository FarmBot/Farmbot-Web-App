class AddMaxImageCountToDevices < ActiveRecord::Migration[5.0]
  def change
    add_column :devices,
               :max_images_count,
               :integer,
               default: Device::DEFAULT_MAX_IMAGES
  end
end
