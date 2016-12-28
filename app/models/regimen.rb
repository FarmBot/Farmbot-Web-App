# Regimens are an order checklist of "TODO" items for a bot, spread out at
# specified times after a start date.
# Examples: Water cabbage 3 times a day for 40 days, then twice a day for 20
#           days after that.
# A regimen takes a SEQUENCES and repeats them over a fixed amount of time slots
class Regimen < ActiveRecord::Base
  # Regimen gets pluralized strangely by Rails.
  # Ocasionally to "regimans".
  # This is the workaround.
  self.table_name = "regimens"
  validates :name, presence: true
  validates :name, uniqueness: { scope: :device }

  has_many   :regimen_items, dependent: :destroy
  belongs_to :device
end
