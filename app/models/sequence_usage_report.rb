# THIS IS A SQL VIEW. IT IS NOT A REAL TABLE.
# Tracks how many resources are using the sequence (if any)
class SequenceUsageReport < ApplicationRecord
  def readonly?
    true
  end
end
