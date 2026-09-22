# A single slot in a tool rack. Lets the sequence builder know things
# like where to put a tool when not in use, where to grab the next tool from,
# etc.
class ToolSlot < Point
  PULLOUT_DIRECTIONS = [NONE = 0,
                        POSITIVE_X = 1,
                        NEGATIVE_X = 2,
                        POSITIVE_Y = 3,
                        NEGATIVE_Y = 4]
  PULLOUT_ERR = "must be one of #{PULLOUT_DIRECTIONS.join(", ")}. " \
                "%{value} is not valid."
  IN_USE = "already in use by another slot. " \
           "Please un-assign the tool from its current slot" \
           " before reassigning."
  MOUNT_STAGES = [MOUNT_STAGE_NONE = 0,
                  MOUNT_STAGE_X = 1,
                  MOUNT_STAGE_Y = 2,
                  MOUNT_STAGE_Z = 3]
  MOUNT_STAGE_ERR = "must be one of #{MOUNT_STAGES.join(", ")}. " \
                    "%{value} is not valid."

  belongs_to :tool
  validates :tool,
            uniqueness: { allow_blank: true,
                          message: IN_USE }
  validates :pullout_direction,
            presence: true,
            inclusion: { in: PULLOUT_DIRECTIONS, message: PULLOUT_ERR }
  validates :mount_stage,
            presence: true,
            inclusion: { in: MOUNT_STAGES, message: MOUNT_STAGE_ERR }
end
