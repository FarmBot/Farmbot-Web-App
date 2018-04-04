# THIS IS A SQL VIEW. IT IS NOT A REAL TABLE.
# Maps Point <==> Sequence
class InUsePoint < ApplicationRecord
  def readonly?
    true
  end
end
