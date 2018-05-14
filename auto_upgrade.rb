require "pry"
class UpgradeFailure < Exception; end

def type_check
  system 'npm run typecheck'
end

def run_tests
  system 'jest --bail'
end

def run_build
  system 'npm run build'
end

def commit_upgrade(dep)
  system('git add -A')
  system("git commit -am 'Upgrade #{dep}' --allow-empty")
end

def upgrade(dep)
  system("yarn add #{dep} --save")
end

def stash(dep)
  puts "stashing failed upgrade for #{dep}"
  system("git stash") && system("yarn install")
end

def attempt(dep, operation, args)
  result = send(operation, *args)
  unless result
    raise UpgradeFailure, "operation failed for #{dep}: #{operation} failed"
  else
    puts "#{operation} for #{dep} OK"
  end
end


# BETTER IDEA:
#   Parse `yarn outdated` list into String[] with format `name@version`
# DEPS = `yarn outdated`
#   .split("\n")[6..-1]
#   .map{|y| y.split }
#   .map{|y| "#{y[0]}@#{y[3]}"}
#   .sort
DEPS = [
  "tslint@5.10.0",
  "typescript@2.8.3",
  "url-loader@1.0.1",
  "@types/enzyme@3.1.10",
  "@types/lodash@4.14.108",
  "@types/node@10.0.8",
  "@types/react-color@2.13.5",
  "@types/react-dom@16.0.5",
  "@types/react@16.3.14",
]

# puts "Making sure that type checks pass WITHOUT any upgrades"
# tc_ok   = type_check

# puts "Making sure tests pass WITHOUT any upgrades"
# test_ok = run_tests

# puts "Making sure build works WITHOUT any upgrades"
# build_ok = run_build

# proceed = tc_ok && test_ok && build_ok

# if (proceed)
#   puts "LOOKS GOOD!"
#   commit_upgrade("START")
# else
#   puts "Make sure types and tests pass before upgrading"
#   exit
# end
FAILED = []
puts "Start upgrade..."
DEPS.each do |dep|
  begin
    attempt(dep, :upgrade,        [dep])
    attempt(dep, :type_check,     [])
    attempt(dep, :run_tests,      [])
    attempt(dep, :run_build,      [])
    attempt(dep, :commit_upgrade, [dep])
  rescue UpgradeFailure => e
    FAILED.push(dep)
    attempt(dep, :stash,          [dep])
  end
end

puts "FAILED UPGRADES:\n"
puts FAILED.join("\n") + "\n"
