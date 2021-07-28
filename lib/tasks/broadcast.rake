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

def prompt(query)
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
    BroadcastToAll.run!(type: prompt("(optional) Enter `type`"),
                        href: prompt("(optional) Enter href"),
                        href_label: prompt("(optional) Enter href label"),
                        title: prompt("Enter title"),
                        content: multiline_prompt("Enter content"))
    puts "DONE"
  end
end
