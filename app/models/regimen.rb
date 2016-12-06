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
