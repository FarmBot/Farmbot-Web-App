class ReasonableStringLengths < ActiveRecord::Migration[5.1]
  TWEETx2 = 280
  def change
    { devices:     "name",
      devices:     "timezone",
      farm_events: "time_unit",
      farm_events: "executable_type",
      logs:        "message",
      logs:        "channels",
      peripherals: "label",
      plants:      "openfarm_slug",
      points:      "name",
      points:      "pointer_type",
      regimens:    "color",
      regimens:    "name",
      sequences:   "name",
      sequences:   "color",
      sequences:   "kind",
      tools:       "name",
      users:       "name",
      users:       "email" }.each do |table, column|
        change_column table, column, :string, limit: TWEETx2
    end
  end
end
