# If you create a "Mark As.." (resource_update) step
# and accidentally delete the resource that it modifies,
# referential integrity issues will emerge.
#
# The Model below is a SQL VIEW.
# It is NOT A TABLE.
#
# It simplifies the process of finding Points that
# are in use by the `resource_update` step.
class PointUsageForResourceUpdateStep < ApplicationRecord
  belongs_to :point, polymorphic: true

  def readonly?
    true
  end
end
