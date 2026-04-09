class GlobalBulletin < ActiveRecord::Base
  self.inheritance_column = "none"
  validates :slug, uniqueness: true
  validates :content, :slug, :type, presence: true
end
