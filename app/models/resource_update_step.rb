# If you create a "Mark As.." (resource_update) step
# and accidentally delete the resource that it modifies,
# referential integrity issues will emerge.
#
# The Model below is a SQL VIEW.
# It is NOT A TABLE.
#
# It simplifies the process of finding Points that
# are in use by the `resource_update` step.
class ResourceUpdateStep < ApplicationRecord
  belongs_to :point

  def readonly?
    true
  end

  # Make sure you preload `self.point` before calling this.
  def fancy_name
    @fancy_name ||= point.fancy_name
  end
end
