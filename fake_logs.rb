$log = {
  z: 0,
  y: 0,
  x: 0,
  verbosity: 1,
  type: "debug",
  major_version: 6,
  minor_version: 4,
  patch_version: 1,
  message: "hey!!!",
  created_at: Time.now.to_i,
  channels: ["email"]
}

$count = 0
$device_ids = Device.all.pluck(:id)

Log.destroy_all

ATTEMPT_LOG = { WORKS: 1, TRIGGERS_ERROR: 0.1 }

def ping(interval = 0)
  sleep interval
  $count += 1
  puts "Log ##{$count}"
  $log[:message] = "Hey! #{$count}"
  $device_ids.map { |id| Transport.amqp_send($log.to_json, id, "logs") }
end

loop do
  puts "Sending..."
  5.times { ping(0.1) }
  puts "Enter to send again, y to exit."
  exit if gets.chomp.downcase == "y"
end
