# THIS IS A SQL VIEW. IT IS NOT A REAL TABLE.
# Maps Tool <==> Sequence
class InUseTool < ApplicationRecord
  def readonly?
    true
  end

  def fancy_name
    tool_name
  end
end
