# PROBLEM: /images is really, really slow right now
# CAUSE?:  https://github.com/thoughtbot/paperclip/issues/2337
#          Need to record some before/ after benchmarks.
# RESULT:
# No modifications
#   RUN TIME: 4.625038789 (20 images - 231.25 ms per image)
# Adding `fog_host` option to GCS:
#   RUN TIME: 0.011753318 (20 images - 0.58 ms per image)
# 393.5% performance boost! :tada:
Image.delete_all

20.times do
  FactoryGirl.create(:image)
end

start_t = Time.now

Image.all.each do |i|
  print "Benchmarking image ##{i.id}: "
  puts i.attachment.url("x640")
end

end_t = Time.now

puts "RUN TIME: #{end_t - start_t}"
