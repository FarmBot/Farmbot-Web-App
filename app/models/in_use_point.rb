# THIS IS A SQL VIEW. IT IS NOT A REAL TABLE.
# Maps Point <==> Sequence
class InUsePoint < ApplicationRecord
  belongs_to :device

  DEFAULT_NAME = "point"
  FANCY_NAMES = {
    GenericPointer.name => DEFAULT_NAME,
    ToolSlot.name => "tool slot",
    Plant.name => "plant",
  }

  def readonly?
    true
  end

  def fancy_name
    "#{InUsePoint::FANCY_NAMES[pointer_type] || DEFAULT_NAME} at (#{x}, #{y}, #{z})"
  end
end
