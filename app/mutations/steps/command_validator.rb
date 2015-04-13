# module Steps
#   class CommandValidator < Mutations::Command
#     required do
#       string :message_type, in: Step::MESSAGE_TYPES
#       hash :command do
#         optional do
#           integer :x
#           integer :y
#           integer :z
#           integer :pin
#           integer :speed
#           integer :duration
#           integer :mode
#           string  :message
#           string  :value
#         end
#       end
#     end

#     def execute
#       return command
#     end
#   end
# end
