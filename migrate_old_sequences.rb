# Demonstrates the problem on all the bad sequence I found.
def try_stuff(id)
  # Find
  s = Sequence.find(id)
  # Display it unserialized
  puts "Locals stored in DB: #{s.args["locals"]}"
  # Create serialized version
  serialized = CeleryScript::FetchCelery.run!(sequence: s)
  # Display serialized version
  puts "But serialized, the value is #{serialized[:args][:locals] || "nil"}"
  # Try to convert it
  converted = CeleryScript::StoreCelery.run!(sequence: s)
  # Display locals
  puts "converted, but unserialized version is #{converted.args[:locals]}"
  # Serialized, converted, real deal.
  puts "After serialization it's #{CeleryScript::FetchCelery.run!(sequence: converted)[:args][:locals]}"
end

def find_next_seq
  Sequence.where(migrated_nodes: false).order("created_at").last
end

next_seq   = find_next_seq
count      = 0
total_time = Time.now

until next_seq == nil
  t = Time.now
  count += 1
  puts "=== Migrating sequence #{next_seq.id}: #{next_seq.name}..."
  Sequence.transaction { CeleryScript::StoreCelery.run!(sequence: next_seq) }
  puts "=== migrated in #{Time.now - t} seconds"
  next_seq = find_next_seq
end

t2 = Time.now - total_time

puts "=== DONE MIGRATING #{count} sequences in #{t2} seconds! (#{count/t2} per second)"
