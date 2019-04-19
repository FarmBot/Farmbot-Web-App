class GlobalBulletin < ApplicationRecord
  self.inheritance_column = "none"
  validates_uniqueness_of :slug
  validates_presence_of :content, :href, :slug, :type

  def maybe_broadcast
    # Opt out of auto sync
  end
end
