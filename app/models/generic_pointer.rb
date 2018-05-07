# Used by third party farmwares (eg: weed-detection) to mark points on a map.
class GenericPointer < Point
  def name_used_when_syncing
    "Point"
  end
end
