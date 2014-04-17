
$farmbot_uuid = "063df52b-0698-4e1c-b2bb-4c0890019782"

require_relative 'lib/skynet/skynet'
require_relative 'lib/botcomm'
require_relative 'lib/cropschedule'
require_relative 'lib/database/dbcommand'
require_relative 'lib/database/dbfarmbot'

puts '[FarmBot schedule transmit]'
puts 'starting up'

# connecting to skynet framework
$skynet = Skynet.new

$farmbot_comm = FarmBotControllerComm.new

while $skynet.identified != true
   sleep 0.5
   print '.'
end
puts ''

puts 'connecting to database'

Mongoid.load!("config/mongo.yml", :development)

puts 'checking list of bots'

  FarmBot.where(:active => true).order_by([:name,:asc]).each do |farmbot|
  puts "checking bot #{farmbot.name} uuid #(farmbot.uuid)"
  
  farmbot.crops.where(:valid_data => true).each do |crop|

    puts "crop type=#{crop.plant_type} @ x=#{crop.coord_x} y=#{crop.coord_y}"

    crop_schedule = CropSchedule.new
    crop_schedule.read_from_db( crop )

    $farmbot_comm.send_schedule(farmbot.uuid,crop_schedule)

  end

end