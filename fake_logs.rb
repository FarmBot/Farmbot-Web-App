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
  created_at: 1523903024,
  channels: [ ]
}

$count = 0
$device_ids = Device.all.pluck(:id)

Log.destroy_all

def ping(interval = 0)
  sleep interval
  $count += 1
  puts "Log ##{$count}"
  $log[:message] = "Hey! #{$count}"
  $device_ids.map { |id| Transport.amqp_send($log.to_json, id, "logs") }
end

10.times { ping(1) }
