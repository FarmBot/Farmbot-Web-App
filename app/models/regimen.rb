# Regimens are an ordered checklist of "TODO" items for a bot,
# spread out at specified times after a start date. Example:
# Water cabbage three times per day during first month, then
# once daily for the next month.
class Regimen < ApplicationRecord
  # Rails inflector does a poor job of pluralizing this word,
  # such as "regimans" or "regimina". This is the workaround.
  # PRs welcome.
  self.table_name = "regimens"

  belongs_to :device
  has_many :regimen_items, dependent: :destroy
  has_many :farm_events, as: :executable
  has_one :fragment, as: :owner
  validates :device, presence: true
  validates :name, presence: true
  validates :name, uniqueness: { scope: :device }

  # Detecting changes in child regimen_items is difficult.
  # Whenever a Regimen is saved, we pretend that the changes
  # require a sync/broadcast even though it is slightly
  # inefficient
  def notable_changes?
    true
  end

  def fancy_name
    name
  end

  def fragment_owner?
    true
  end
end
