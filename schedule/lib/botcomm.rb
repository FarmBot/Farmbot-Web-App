
# ####################################
# Send something to farmbot controller
# ####################################

class FarmBotControllerComm

  # send command to farmbot
  def send_single_command(action, x, y, z, amount, speed, delay)
  
    $skynet.confirmed = false
    command =
      {
        :message_type => 'single_command',
        :time_stamp   => Time.now.to_f.to_s,
        :command      => {
          :action  => action,
          :x       => x,
          :y       => y,
          :z       => z,
          :speed   => speed,
          :amount  => amount,
          :delay   => delay
          }}


    $skynet.send_message($farmbot_uuid, command)
    return wait_for_confirmation()

  end


  # send schedule to farmbot
  def send_schedule(uuid, schedule)
  
    $skynet.confirmed = false

    sched_hash = schedule.to_hash
    sched_hash[:message_type] = 'crop_schedule_update'
    sched_hash[:time_stamp]   = Time.now.to_f.to_s

    puts sched_hash

    $skynet.send_message(uuid, sched_hash)
    return wait_for_confirmation()

  end

  def wait_for_confirmation
    puts 'waiting for confirmation'
    count = 0
    while $skynet.confirmed != true and count < 10
       sleep 0.5
       print '.'
       count += 1
    end

    puts ''
  
    if $skynet.confirmed
      puts 'confirmation received'
      return true
    else
      puts 'confirmation timed out'
      sleep 2
      return false
    end
  
  end

end