
$farmbot_uuid = "063df52b-0698-4e1c-b2bb-4c0890019782"

require_relative 'lib/device/device'
require_relative 'lib/botcomm'

puts '[FarmBot Remote Control]'
puts 'starting up'

# connecting to skynet framework
$device = Device.new

$farmbot_comm = FarmBotControllerComm.new

while $device.identified != true
   sleep 0.5
   print '.'
end
puts ''

# send schedule to farmbot
def send_singe_command(action, x, y, z, amount, speed, delay)

  $farmbot_comm.send_single_command(action, x, y, z, amount, speed, delay)

end


$shutdown		= 0

# just a little menu for testing

$move_size = 10
$command_delay = 0

while $shutdown == 0 do

  system('cls')
  system('clear')
  
  puts '[FarmBot Controller Menu]'
  puts ''
  puts 'p - stop'
  puts ''
  puts "move size = #{$move_size}"
  puts "command delay = #{$command_delay}"
  puts ''
  puts 'w - forward'
  puts 's - back'
  puts 'a - left'
  puts 'd - right'
  puts 'r - up'
  puts 'f - down'
  puts ''
  puts 'z - home z axis'	
  puts 'x - home x axis'	
  puts 'c - home y axis'	
  puts ''
  puts 'y - dose water'
  puts ''
  puts 'q - step size'	
  puts 'g - delay seconds'	
  puts ''
  print 'command > '
  input = gets
  puts ''
    
  case input.upcase[0]
    when "P" # Quit
      $shutdown = 1
      puts 'Shutting down...'
    when "O" # Get status
      puts 'Not implemented yet. Press \'Enter\' key to continue.'
      gets
    when "Q" # Set step size
      print 'Enter new step size > '
      move_size_temp = gets
      $move_size = move_size_temp.to_i if move_size_temp.to_i > 0
    when "G" # Set step delay (seconds)
      print 'Enter new delay in seconds > '
      command_delay_temp = gets
      $command_delay = command_delay_temp.to_i if command_delay_temp.to_i > 0
    when "Y" # Water
      send_single_command('DOSE WATER', 0, 0, 0, 15, 0, $command_delay)
    when "Z" # Move to home
      send_single_command('HOME Z', 0, 0, 0, 0, 0, $command_delay)
    when "X" # Move to home
      send_single_command('HOME X', 0, 0, 0, 0, 0, $command_delay)
    when "C" # Move to home
      send_single_command('HOME Y',0 ,0 ,-$move_size, 0, 0, $command_delay)
    when "W" # Move forward
      send_single_command('MOVE RELATIVE',0,$move_size, 0, 0, 0, $command_delay)
    when "S" # Move back
      send_single_command('MOVE RELATIVE',0,-$move_size, 0, 0, 0, $command_delay)
    when "A" # Move left
      send_single_command('MOVE RELATIVE', -$move_size, 0, 0, 0, 0, $command_delay)
    when "D" # Move right
      send_single_command('MOVE RELATIVE', $move_size, 0, 0, 0, 0, $command_delay)
    when "R" # Move up
      send_single_command('MOVE RELATIVE', 0, 0, $move_size, 0, 0, $command_delay)
    when "F" # Move down		
      send_single_command("MOVE RELATIVE", 0, 0, -$move_size, 0, 0, $command_delay)
  end
end			
