class Regimen < ActiveRecord::Base
  # Regimen gets pluralized strangely by Rails.
  # Ocasionally to "regimans".
  # This is the workaround.
  self.table_name = "regimens"

  has_many   :regimen_items
  belongs_to :device, dependent: :destroy
  validates :email, uniqueness: true
end
