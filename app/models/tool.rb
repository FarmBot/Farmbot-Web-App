# *Physical* information about a device attached to the tool mount. Not to be
# confused with Peripherals, which keep track of electronic data such as pin
# modes.
class Tool < ApplicationRecord
  # We need this for the "status" virtual attribute in ToolSerializer.
  # I could not figure out how to get AR to do it without N+1s.
  # Help appreciated on this one if anyone can get this working the "Rails way"
  BASE = 'SELECT
                  "tools".*,
                  points.id as tool_slot_id
                FROM
                  "tools"
                LEFT OUTER JOIN
                  "points" ON "points"."tool_id" = "tools"."id"
                WHERE'
  INDEX_QUERY = BASE + ' "tools"."device_id" = %s;'
  SHOW_QUERY = BASE + ' "tools"."id" = %s;'
  IN_USE = "Tool in use by the following sequences: %s"

  belongs_to :device
  has_one :tool_slot
  validates :device, presence: true
  validates :name, uniqueness: { scope: :device }

  def self.outer_join_slots(device_id)
    self.find_by_sql(INDEX_QUERY % device_id)
  end

  def self.join_tool_slot_and_find_by_id(id)
    # Adding the || self.find part to raise 404 like "normal" AR queries.
    # TODO: Clean this whole thing up - RC 2-may-18
    self.find_by_sql(SHOW_QUERY % id).first || self.find(id)
  end
end
