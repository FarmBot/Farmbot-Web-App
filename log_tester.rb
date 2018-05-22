# Creates a bajilliondyeven logs.

devices = Device.all

loop do
  devices.map do |d|
    sleep 0.05
    msg = SecureRandom.hex
    print msg.first
    2.times { d.tell(msg) }
  end
end
