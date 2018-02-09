
def find_next_seq
  Sequence.where(migrated_nodes: false).order("created_at").last
end
next_seq   = find_next_seq
count      = 0
total_time = Time.now
until next_seq == nil
  t = Time.now
  count += 1
  puts "=== Migrating sequence #{next_seq.id}: #{next_seq.name}"
  Sequence.transaction { CeleryScript::StoreCelery.run!(sequence: next_seq) }
  puts "=== migrated in #{Time.now - t} seconds"
  next_seq = find_next_seq
end

t2 = Time.now - total_time

puts "=== DONE MIGRATING #{count} sequences in #{t2} seconds! (#{count/t2} per second)"
