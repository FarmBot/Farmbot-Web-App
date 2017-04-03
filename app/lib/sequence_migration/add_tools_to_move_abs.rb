module SequenceMigration
  # Background:
  # When this migration was created, the move_absolute block could only move to
  # a fixed point on the map.
  # After this migration, the user could move to a dynamically set tool location
  # -OR- a fixed point on the map. It also added an "offset" property for tools
  # with funny sizes.
  class AddToolsToMoveAbs < Base
    VERSION = 2
    CREATED_ON = "DECEMBER 19 2016"

    def up
      sequence
        .body
        .select { |x| x["kind"] == "move_absolute" }
        .each   do |x|
          # THIS IS MY FAULT. 25 JAN 17, RC.
          # I must fix a mistake I made. Some sequence.args.version was `nil`
          # but actually should have been `4`.
          if (x["args"].keys.include?("location"))
            # I will need to manually fix these.
            Rollbar.info("Sequence #{sequence.id} is bad.")
          else

            x["args"] = {
                 "location" => {
                   "kind" => "coordinate",
                   "args" => {
                      "x" => (x.dig("args", "x") || 0),
                      "y" => (x.dig("args", "y") || 0),
                      "z" => (x.dig("args", "z") || 0)
                    }
                  },
                 "offset" => {
                    "kind" => "coordinate",
                    "args" => { "x" => 0, "y" => 0, "z" => 0 }
                 },
                 "speed" => 800
              }
          end
        end
    end
  end
end
