Device
  .all
  .map do |dev|
    dev.auto_sync_transaction do
      FactoryBot.create(:diagnostic_dump, device: dev)
    end
  end

# begin
#   # NoMethodError (undefined method `generate_key' for nil:NilClass)
#   x = Rails.application.app.call({
#     "CONTENT_TYPE"    => "application/x-www-form-urlencoded",
#     "HTTP_ACCEPT"     => "application/json",
#     "HTTP_COOKIE"     => "",
#     "HTTP_HOST"       => "test.host",
#     "HTTP_USER_AGENT" => "Rails Testing",
#     "HTTPS"           => "off",
#     "PATH_INFO"       => "/api/sequences",
#     "QUERY_STRING"    => "",
#     "REMOTE_ADDR"     => "0.0.0.0",
#     "REQUEST_METHOD"  => "POST",
#     "SCRIPT_NAME"     => "",
#     "SERVER_NAME"     => "example.org",
#     "SERVER_PORT"     => "80",
#     "rack.input"      => StringIO.new("{\"name\":\"Scare Birds\",\"body\":[]" +
#                                       ",\"args\":{\"locals\":{\"kind\":\"sco" +
#                                       "pe_declaration\",\"args\":{},\"body\"" +
#                                       ":[{\"kind\":\"parameter_declaration\"" +
#                                       ",\"args\":{\"label\":\"parent\",\"dat" +
#                                       "a_type\":\"PlantSpelledBackwards\"}}]" +
#                                       "}}}")
#   })
#   File.write("notes.html", x.last.last)
#   puts "Look at notes.html"
#   binding.pry
# rescue => e
#   binding.pry
# end
