$devices = Device.all

loop do
  sleep 0.05
  $devices.each do |d|
    msg = SecureRandom.hex
    print msg.first
    d.tell(msg)
    d.tell(msg)
  end
end
