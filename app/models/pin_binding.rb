class PinBinding < ApplicationRecord
  belongs_to :device
  belongs_to :sequence

  def fancy_name
    "pin #{pin_num}"
  end
end
