class GlobalBulletin  < ActiveRecord::Base
  self.inheritance_column = "none"
  validates_uniqueness_of :slug
  validates_presence_of :content, :href, :slug, :type
end
