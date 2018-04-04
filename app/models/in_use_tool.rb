# THIS IS A SQL VIEW. IT IS NOT A REAL TABLE.
class InUseTool < ApplicationRecord
  def readonly?
    true
  end
end
