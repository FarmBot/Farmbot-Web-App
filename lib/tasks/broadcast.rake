# The code in this file will (as the name suggests) broadcast to _all_ devices.
# If you need to do a broadcast to a subset of users, here's
# an example snippet:
#
#     title = "Announcing: Stuff"
#     content = " <b>HTML is OK!</b>"
#     slug = title.parameterize
#     default_tag = Alert::BULLETIN.fetch(:problem_tag)
#     devices = Device.where(foo: "bar")
#     bulletin = GlobalBulletin.create!(title: title,
#                                       type: "info",
#                                       content: content,
#                                       slug: slug,
#                                       href: "https://example.com",
#                                       href_label: "Click Here!")
#     devices.map do |d|
#       Alerts::Create.run!(problem_tag: default_tag, device: d, slug: slug)
#     end
class BroadcastToAll < Mutations::Command
  required do
    string :title
    string :content
  end

  optional do
    string :type, default: "info"
    string :href
    string :href_label
  end

  def execute
    create_bulletin
    print_bulletin(@bulletin)
    attach_alerts
  end

  def create_bulletin
    @bulletin ||= GlobalBulletin.create!(title: title,
                                         type: type,
                                         content: content,
                                         slug: slug,
                                         href: href,
                                         href_label: href_label)
  end

  def slug
    @slug ||= title.parameterize
  end

  def devices
    @devices ||= Device.all
  end

  def attach_alerts
    puts "This will take a while..."
    devices.map do |d|
      puts "attaching Alert to Device #{d.id}"
      Alerts::Create.run!(problem_tag: Alert::BULLETIN.fetch(:problem_tag),
                          device: d,
                          slug: slug)
    end
  end
end

class BroadcastToOne < BroadcastToAll
  required do
    string :device_id
  end

  def devices
    @devices ||= [Device.find(device_id.to_i)]
  end
end

def print_bulletin(bulletin)
  puts "=" * 100
  puts "bulletin slug: #{bulletin.slug}"
  puts
  puts JSON.pretty_generate(JSON.parse(bulletin.to_json))
  puts "=" * 100
end

class BroadcastExistingToAll < Mutations::Command
  required do
    string :slug
  end

  def execute
    maybe_edit
    attach_alerts
  end

  def maybe_edit
    while true
      bulletin = GlobalBulletin.find_by!(slug: slug)
      print_bulletin(bulletin)
      ok = simple_prompt("Edit? (y/N)") || "n"
      if ok.downcase != "n"
        while true
          field = simple_prompt("field to edit")
          if ["href", "href_label", "title", "type", "content"].include?(field)
            break
          else
            puts "Can't edit that field."
          end
        end
        content = simple_prompt("new value")
        bulletin.update(field => content)
        puts "Refresh browser to view changes."
      else
        break
      end
    end
  end

  def devices
    @devices ||= Device.where.not(id: alerts.pluck(:device_id))
  end

  def alerts
    @alerts ||= Alert.where(slug: slug)
  end

  def attach_alerts
    count = alerts.count
    if count > 5
      puts "This alert has already been broadcast to #{count} users. " \
           "Edits will show to users upon refresh. Exiting."
      return
    end
    ok = simple_prompt("Broadcast to all users? (Y/n)") || "y"
    if ok.downcase != "y"
      puts "exiting"
      return
    end
    puts "This will take a while..."
    devices.map do |d|
      puts "attaching Alert to Device #{d.id}"
      Alerts::Create.run!(problem_tag: Alert::BULLETIN.fetch(:problem_tag),
                          device: d,
                          slug: slug)
    end
    puts "done"
  end
end

def simple_prompt(query)
  puts "=== #{query}"
  output = STDIN.gets.chomp
  output.length == 0 ? nil : output
end

def multiline_prompt(query)
  puts "=== #{query}"
  puts "TYPE @@@ TO FINISH"
  buffer = []
  loop {
    chunk = STDIN.gets.chomp
    break if chunk == "@@@" # Just to show one example for a break condition here
    buffer.push(chunk)
  }
  buffer.length == 0 ? nil : buffer.join("\n")
end

namespace :broadcast do
  desc "Create a global bulletin for all users"
  task to_all: :environment do
    puts "BEGIN"
    BroadcastToAll.run!(type: simple_prompt("(optional) Enter `type`"),
                        href: simple_prompt("(optional) Enter href"),
                        href_label: simple_prompt("(optional) Enter href label"),
                        title: simple_prompt("Enter title"),
                        content: multiline_prompt("Enter content"))
    puts "DONE"
  end

  desc "Create a global bulletin for one user"
  task to_one: :environment do
    type = simple_prompt("(optional) Enter `type`")
    href = simple_prompt("(optional) Enter href")
    href_label = simple_prompt("(optional) Enter href label")
    while true
      title = simple_prompt("Enter title")
      if title.nil?
        next
      end
      if GlobalBulletin.find_by(slug: title.parameterize).nil?
        break
      else
        puts "Title already exists. Try another."
      end
    end
    while true
      content = multiline_prompt("Enter content")
      if content.nil? || content.strip.length == 0
        puts "Content cannot be blank."
      else
        break
      end
    end
    while true
      device_id = simple_prompt("Enter device ID")
      device = Device.find_by(id: device_id.to_i)
      if device.nil?
        puts "Device not found."
      else
        break
      end
    end
    BroadcastToOne.run!(type: type,
                        href: href,
                        href_label: href_label,
                        title: title,
                        content: content,
                        device_id: device_id)
  end

  desc "Broadcast existing bulletin to all users"
  task existing_to_all: :environment do
    while true
      slug = simple_prompt("Bulletin slug")
      bulletin = GlobalBulletin.find_by(slug: slug)
      if bulletin.nil?
        puts "Bulletin not found."
      else
        break
      end
    end
    BroadcastExistingToAll.run!(slug: slug)
  end
end
