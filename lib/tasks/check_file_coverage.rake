require 'nokogiri'
require 'find'

API_COVERAGE_INDEX = File.join('coverage_api', 'index.html')

def normalize_frontend_path(path, frontend_root)
  return path if path.start_with?(frontend_root + "/")
  return path.sub(%r{^.*?/frontend/}, frontend_root + "/") if path.include?("/frontend/")
  path
end

def load_lcov_coverage(path, frontend_root)
  return {} unless File.exist?(path)
  files = {}
  current = nil
  File.foreach(path) do |raw_line|
    line = raw_line.strip
    case line
    when /^SF:(.+)/
      file_path = normalize_frontend_path(Regexp.last_match(1), frontend_root)
      current = files[file_path] = {
        lines: { covered: 0, total: 0 },
        branches: { covered: 0, total: 0 },
        functions: { covered: 0, total: 0 },
      }
    when /^LH:(\d+)/
      current[:lines][:covered] = Regexp.last_match(1).to_i if current
    when /^LF:(\d+)/
      current[:lines][:total] = Regexp.last_match(1).to_i if current
    when /^BRH:(\d+)/
      current[:branches][:covered] = Regexp.last_match(1).to_i if current
    when /^BRF:(\d+)/
      current[:branches][:total] = Regexp.last_match(1).to_i if current
    when /^FNH:(\d+)/
      current[:functions][:covered] = Regexp.last_match(1).to_i if current
    when /^FNF:(\d+)/
      current[:functions][:total] = Regexp.last_match(1).to_i if current
    when "end_of_record"
      current = nil
    end
  end
  files
end

def changed_files_from_env
  ENV.fetch('CHANGED_FILES', '').split(',').reject(&:empty?)
end

namespace :check_file_coverage do
  desc "Check test coverage for one or more app files after running `rspec`. " +
       "Usage: rake check_file_coverage:api app/models/device.rb"
  task api: :environment do
    abort("Run `rspec spec` first.") unless File.exist?(API_COVERAGE_INDEX)

    task_name = Rake.application.top_level_tasks.first
    task_index = ARGV.index(task_name)
    paths_args = ARGV.drop(task_index + 1)

    if paths_args.empty?
      paths = []
      Find.find('app') do |file|
        paths << file if file.end_with?('.rb') && File.file?(file)
      end
    else
      paths = paths_args
    end

    doc = Nokogiri::HTML(File.read(API_COVERAGE_INDEX))
    failed = false

    define_method(:report_failure) do |path, message|
      puts "❌ #{path}: #{message}"
      failed = true
    end

    paths.each do |path|
      unless path.start_with?('app/')
        report_failure(path, "Invalid path. Must start with 'app/'.")
        next
      end

      header = doc.css('h3').find { |h| h.text.strip == path }
      unless header
        report_failure(path, "File not found in coverage report.")
        next
      end

      span = header.next_element&.at('span')
      unless span
        report_failure(path, "Coverage span not found.")
        next
      end

      coverage_text = span.text.strip
      percentage = coverage_text.delete('%').to_f

      if percentage < 100
        report_failure(path, "#{coverage_text} (not fully covered)")
      else
        if !paths_args.empty?
          puts "✅ #{path}: #{coverage_text}"
        end
      end
    end

    if failed
      abort("One or more files did not meet coverage requirements. (FAIL)")
    else
      if paths_args.empty?
        puts "All files at 100%! (PASS)"
      end
    end
  end

  desc "Check frontend file coverage after running `bun test`. " +
       "Usage: rake check_file_coverage:fe [frontend/app.tsx]"
  task fe: :environment do
    frontend_root = 'frontend'
    coverage_root = 'coverage_fe'
    lcov_file_path = File.join(coverage_root, 'lcov.info')

    task_name = Rake.application.top_level_tasks.first
    task_index = ARGV.index(task_name)
    task_args = ARGV.drop(task_index + 1)
    paths_args = task_args

    lcov_coverage = load_lcov_coverage(lcov_file_path, frontend_root)
    abort("Run `bun test` first.") if lcov_coverage.empty?

    check_changed_files = ENV.key?('CHANGED_FILES')
    changed_files = changed_files_from_env
    no_changed_files = check_changed_files && changed_files.empty?
    print_file_statuses = !paths_args.empty? || (check_changed_files && changed_files.any?)

    if check_changed_files && changed_files.any?
      paths = lcov_coverage.keys.select do |frontend_path|
        normalized_frontend_path = frontend_path.sub(/^frontend\//, '')
        changed_files.any? { |file| file.end_with?(normalized_frontend_path) }
      end
      matched_changed_files = changed_files.select do |file|
        paths.any? do |frontend_path|
          normalized_frontend_path = frontend_path.sub(/^frontend\//, '')
          file.end_with?(normalized_frontend_path)
        end
      end
      (changed_files - matched_changed_files).each do |file|
        puts "↷ #{file}: skipped (not in frontend coverage report)"
      end
    elsif paths_args.empty?
      paths = lcov_coverage.keys
    else
      paths = paths_args.map do |path|
        normalize_frontend_path(path.sub(%r{^#{Regexp.escape(coverage_root)}/}, ''), frontend_root)
      end
    end

    failed = false
    checked_count = 0

    define_method(:report_failure) do |path, message|
      puts "❌ #{path}: #{message}"
      failed = true
    end

    paths.each do |frontend_path|
      if frontend_path.end_with?('.d.ts') || frontend_path.end_with?('interfaces.ts')
        puts "↷ #{frontend_path}: skipped" if print_file_statuses
        next
      end

      checked_count += 1

      coverage = lcov_coverage[frontend_path]
      unless coverage
        report_failure(frontend_path, "Coverage file not found in LCOV report.")
        next
      end

      line_total = coverage[:lines][:total].to_f
      line_hit = coverage[:lines][:covered].to_f
      branch_total = coverage[:branches][:total].to_f
      branch_hit = coverage[:branches][:covered].to_f
      function_total = coverage[:functions][:total].to_f
      function_hit = coverage[:functions][:covered].to_f

      percent = ->(hit, total) { total == 0 ? 100.0 : (hit / total * 100.0) }

      metrics = {
        "Statements" => percent.call(line_hit, line_total),
        "Branches" => percent.call(branch_hit, branch_total),
        "Functions" => percent.call(function_hit, function_total),
        "Lines" => percent.call(line_hit, line_total),
      }

      incomplete = metrics.select { |_k, v| v < 100.0 }

      if incomplete.any?
        messages = incomplete.map { |k, v| "#{k}: #{format('%.2f', v)}%" }.join(", ")
        report_failure(frontend_path, "Not fully covered (#{messages})")
      else
        puts "✅ #{frontend_path}: 100% coverage on all metrics" if print_file_statuses
      end
    end

    if failed
      puts "\n\nNo changed frontend files found; checked all frontend files." if no_changed_files
      abort("One or more files did not meet coverage requirements. (FAIL)")
    else
      if no_changed_files
        puts "All files at 100%! (PASS)"
        puts "\n\nNo changed frontend files found."
      elsif check_changed_files
        puts "All changed files at 100%! (PASS)"
      elsif paths_args.empty?
        puts "All files at 100%! (PASS)"
      end
    end
  end
end
