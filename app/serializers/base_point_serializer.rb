class BasePointSerializer < ApplicationSerializer
  attributes :device_id, :name, :pointer_type, :meta, :x, :y, :z

  # PROBLEM:
  #   * Users need a mutable way to mark a plant's creation time => `planted_at`
  #   * DB Admin needs to know the _real_ created_at time.
  #   * We can't change field names (or destroy data) that is in use by legacy devices
  #
  # SOLUTION:
  #   * Don't allow users to modify `created_at`
  #   * Provide `planted_at` if possible.
  #   * Always provide `planted_at` if it is available
  #   * Provide a read-only view of `created_at` if `planted_at` is `nil`
  def planted_at
    object.planted_at || object.created_at
  end

  def created_at
    planted_at
  end

  def meta
    object.meta || {}
  end
end
