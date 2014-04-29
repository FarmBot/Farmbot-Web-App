# This module holds our data definitions to store all basic plant and watering data
# Mongo is used as the database, Mongoid as the databasemapper

require 'bson'
require 'mongo'
require 'mongoid'

#require 'bson_ext'

# The different farmbots are stored here

class FarmBot
  include Mongoid::Document

  embeds_many :crops
  
  field :active
  field :name
  field :environmental_coefficient
  field :uuid
    
  # also needs user settings, security and whatsnot
  
end

# The list of crops tended by one farm bot. The crop is planted as a seed (age = 0) or when it has already sprouted.
# Coordinates x, y and z are used to drive the robot to the right place
# The age of maturing and harvesting should be customized to local conditions

class Crop
  include Mongoid::Document
  
  embedded_in :farmbot
  embeds_many :grow_coefficients
  embeds_many :waterings
  embeds_many :historic_actions
  embeds_many :scheduled_commands

  field :plant_type
  field :coord_x
  field :coord_y
  field :coord_z
  field :radius
  field :height
  field :status
  
  field :date_at_planting
  field :age_at_planting
  field :age_at_fully_grown
  field :age_at_harvest
  
  field :valid_data
  field :crop_id
  
end

# Coefficients are used by the evapotransporation system. It expresses the amount of water (mm/day) the plant needs for a good growth at a certain age
# The values for the coefficient is the result of the local climate reference value multiplied with the 
# The age is represented as a precentage, where 100% is fully grown and 200% is ready for harvesting

# a typical curve for a crops. the Y axis is here a multiplication factor for the reference crops (fictional grass or alfalfa)
#
# 1.0         *****
#            *|    **
#           * |      *** 
#          *  |         |
#        **   |         |
# 0.1 ***     |         |
# |           |         | 
# 0%         100%       200%

class GrowCoefficient
  include Mongoid::Document

  embedded_in :crop

  field :age_in_percentage
  field :amount_water_manual

end

# These are the times when the robot is supposed to water the crop

class Watering
  include Mongoid::Document

  embedded_in :crop

  field :time
  field :percentage
end

# A log of what happended to the plant. Waterings and rainfall are the most important probably

class HistoricAction
  include Mongoid::Document

  embedded_in :crop

  field :start_time
  field :stop_time
  field :action
  field :amount
end

# This is the schedule for the next hours/days that the bot has to execute. This is synchronized to the bot.

class ScheduledCommand
  include Mongoid::Document

  embedded_in :crop
  embeds_many :scheduled_command_lines
  
  
  field :crop_id
  field :schedule_id
  field :one_time_command
  field :scheduled_time
  field :command_id
end

class ScheduledCommandLine
  include Mongoid::Document

  embedded_in :scheduled_command

  field :action
  field :coord_x
  field :coord_y
  field :coord_z
  field :speed
  field :amount
end

