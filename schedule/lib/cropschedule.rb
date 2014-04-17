
#
# Classes to make a schedule that can be transmitted to the bot
#

class CropSchedule

  attr_accessor :crop_id

  def initialize
    @commands = Array.new
  end

  def read_from_db(crop)
    @crop_id = crop.crop_id

    crop.scheduled_commands.each do |dbcommand|
      
      command = CropScheduleCommand.new
      command.read_from_db(dbcommand)
      add_command(command)
      
    end
  end

  def to_hash
    command_nr = 0
    schedule_hash = {:crop_id => @crop_id, :commands => {} }
    commands = Hash.new
    @commands.each do |command|
      command_nr += 1
      commands["command_#{command_nr}"]= command.to_hash
   end
   schedule_hash[:commands] = commands
   return schedule_hash
  end

  def add_command(command)

    @commands << command

  end

end

class CropScheduleCommand

  attr_accessor :scheduled_time

  def initialize
    @command_lines = Array.new
  end

  def read_from_db(command)
puts command
puts command.scheduled_time
    @scheduled_time = command.scheduled_time
    seq = 0

    command.scheduled_command_lines.each do |dbline|

      seq += 1
      line = CropScheduleCommandLine.new
      line.read_from_db(dbline, seq)
      add_command_line(line)
      
    end
  end

  def to_hash
    sequence_nr = 0
    command_hash = {:scheduled_time => @scheduled_time, :command_lines => {} }
    command_lines = Hash.new
    @command_lines.each do |line|    
      sequence_nr += 1
      line.sequence_nr = sequence_nr
      command_lines["command_line_#{sequence_nr}"]= line.to_hash
    end
    command_hash[:command_lines] = command_lines    
    return command_hash
  end

  def add_command_line(line)
    @command_lines << line
  end

end

class CropScheduleCommandLine

  attr_accessor :action, :x, :y, :z, :amount, :speed, :sequence_nr

  def read_from_db(line, sequence_nr)
    @action      = line.action
    @x           = line.coord_x
    @y           = line.coord_y
    @z           = line.coord_z
    @amount      = line.amount
    @speed       = line.speed
    @sequence_nr = sequence_nr
  end

  def to_hash

    line = {
      :action      => @action     , 
      :x           => @x          ,
      :y           => @y          ,
      :z           => @z          ,
      :amount      => @amount     ,
      :speed       => @speed      ,
      :sequence_nr => @sequence_nr
    }
    return line

  end

end
