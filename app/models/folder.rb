class Folder < ApplicationRecord
  belongs_to :device
  belongs_to :device, dependent: :destroy

  has_many :sub_folders, class_name: "Folder",
                          foreign_key: "parent_id"

  belongs_to :parent, class_name: "Folder", optional: true
end
