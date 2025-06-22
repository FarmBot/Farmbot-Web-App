require 'nokogiri'
require 'find'

API_COVERAGE_INDEX = File.join('coverage_api', 'index.html')

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

  desc "Check frontend file coverage after running `npm run test-slow`. " +
       "Usage: rake check_file_coverage:frontend frontend/app.tsx"
  task fe: :environment do
    FRONTEND_ROOT = 'frontend'
    COVERAGE_ROOT = 'coverage_fe'

    task_name = Rake.application.top_level_tasks.first
    task_index = ARGV.index(task_name)
    paths_args = ARGV.drop(task_index + 1)

    if paths_args.empty?
      paths = []
      Find.find('coverage_fe/frontend') do |file|
        paths << file if file.end_with?('.html') && File.file?(file)
      end
    else
      paths = paths_args.map do |p|
        path = if p.start_with?(COVERAGE_ROOT + "/")
          p
        else
          File.join(COVERAGE_ROOT, p)
        end
        path.end_with?('.html') ? path : "#{path}.html"
      end
    end

    changed_files = ENV['CHANGED_FILES']&.split(',')
    changed_files_exists = !changed_files.nil? && !changed_files.empty?

    failed = false

    define_method(:report_failure) do |path, message|
      puts "❌ #{path}: #{message}"
      failed = true
    end

    paths.each do |html_path|
      frontend_path = html_path
        .sub(/^#{Regexp.escape(COVERAGE_ROOT)}\//, '')
        .sub(/\.html$/, '')
      if changed_files_exists
        normalized_frontend_path = frontend_path.sub(/^frontend\//, '')
        unless changed_files.any? { |f| f.end_with?(normalized_frontend_path) }
          next
        end
      end

      if frontend_path.end_with?('.d.ts') || frontend_path.end_with?('interfaces.ts')
        next
      end

      unless File.exist?(html_path)
        report_failure(frontend_path, "Coverage file not found: #{html_path}")
        next
      end

      doc = Nokogiri::HTML(File.read(html_path))
      coverage_blocks = doc.css('.pad1y.space-right2')
      metrics = {}

      coverage_blocks.each do |block|
        strong = block.at_css('.strong')&.text&.strip
        label = block.at_css('.quiet')&.text&.strip
        metrics[label] = strong&.delete('%')&.to_f if strong && label
      end

      missing_metrics = %w[Statements Branches Functions Lines] - metrics.keys
      if missing_metrics.any?
        report_failure(frontend_path, "Missing metrics: #{missing_metrics.join(', ')}")
        next
      end

      incomplete = metrics.select { |_k, v| v < 100.0 }

      if incomplete.any?
        messages = incomplete.map { |k, v| "#{k}: #{v}%" }.join(", ")
        report_failure(frontend_path, "Not fully covered (#{messages})")
      else
        if !paths_args.empty? || changed_files_exists
          puts "✅ #{frontend_path}: 100% coverage on all metrics"
        end
      end
    end

    if failed
      abort("One or more files did not meet coverage requirements. (FAIL)")
    else
      if paths_args.empty?
        if changed_files_exists
          puts "All changed files at 100%! (PASS)"
        else
          puts "All files at 100%! (PASS)"
        end
      end
    end
  end
end
