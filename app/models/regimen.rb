# Regimens are an ordered checklist of "TODO" items for a bot, spread out at
# specified times after a start date.
# Examples: Water cabbage 3 times a day for 40 days, then twice a day for 20
#           days after that.
# A regimen takes a SEQUENCES and repeats them over a fixed amount of time slots
class Regimen < ApplicationRecord
  # Regimen gets pluralized strangely by Rails.
  # Occasionally to "regimans".
  # This is the workaround.
  self.table_name = "regimens"
  validates :name, presence: true
  validates :name, uniqueness: { scope: :device }
  has_many  :farm_events, as: :executable

  has_many   :regimen_items, dependent: :destroy
  belongs_to :device
  validates  :device, presence: true
  has_one    :fragment,  as: :owner

  # PROBLEM:
  #  * sync messages send MQTT packets when models update in a background job.
  #  * regimen_items are a "nested resource". The user does not know they exist
  #    outside of a regimen
  #  * We still need to be notified of updates to `regimen_item`s.
  #
  # SOLUTION:
  #  * _always_ send update messages for Regimens, even though its kind of
  #    wasteful.
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
