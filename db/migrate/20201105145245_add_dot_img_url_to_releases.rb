class AddDotImgUrlToReleases < ActiveRecord::Migration[6.0]
  def change
    add_column :releases, :dot_img_url, :string
  end
end
