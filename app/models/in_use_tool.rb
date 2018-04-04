# THIS IS A SQL VIEW. IT IS NOT A REAL TABLE.
# Maps Tool <==> Sequence
class InUseTool < ApplicationRecord
  def readonly?
    true
  end
end
