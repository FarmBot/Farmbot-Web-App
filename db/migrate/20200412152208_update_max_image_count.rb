class UpdateMaxImageCount < ActiveRecord::Migration[6.0]
  def change
    change_column_default(:devices, :max_images_count, 450)
  end
end
