#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "objspace"
require "pathname"
require "time"
require_relative "../config/environment"

module BootReport
  module_function

  ROOT = Pathname.new(File.expand_path("..", __dir__))

  def run
    # Match production boot behavior when this script is run outside Passenger.
    Rails.application.eager_load! unless Rails.configuration.eager_load

    puts JSON.pretty_generate(
      {
        generated_at: Time.now.utc.iso8601,
        ruby: {
          version: RUBY_VERSION,
          platform: RUBY_PLATFORM,
          engine: defined?(RUBY_ENGINE) ? RUBY_ENGINE : "ruby",
        },
        rails: {
          version: Rails.version,
          env: Rails.env,
          eager_load: Rails.configuration.eager_load,
          load_defaults: load_defaults_target,
        },
        loaded: {
          gem_count: Gem.loaded_specs.size,
          feature_count: $LOADED_FEATURES.size,
          features_by_gem: features_by_gem,
          app_features: app_features,
        },
        memory: {
          object_counts: ObjectSpace.count_objects,
          memsize_of_all: ObjectSpace.memsize_of_all,
          memsize_by_type: memsize_by_type,
          class_count: ObjectSpace.each_object(Class).count,
          module_count: ObjectSpace.each_object(Module).count,
        },
        rails_paths: {
          eager_load_paths: normalize_paths(Rails.configuration.eager_load_paths),
          autoload_paths: normalize_paths(Rails.configuration.autoload_paths),
          autoload_once_paths: normalize_paths(Rails.configuration.autoload_once_paths),
          zeitwerk_dirs: zeitwerk_dirs,
        },
      }
    )
  end

  def load_defaults_target
    return nil unless Rails.application.class.respond_to?(:load_defaults)
    # Rails does not expose the configured target directly; infer from config object when possible.
    config = Rails.application.config
    if config.respond_to?(:loaded_config_version)
      config.loaded_config_version
    end
  end

  def normalize_paths(paths)
    paths.map { |path| Pathname.new(path.to_s).cleanpath.to_s }.sort
  end

  def features_by_gem
    specs = Gem.loaded_specs.values.sort_by(&:name)

    specs.filter_map do |spec|
      full_path = spec.full_gem_path
      next if full_path.nil? || full_path.empty?

      count = $LOADED_FEATURES.count { |feature| feature.start_with?(full_path) }
      next if count.zero?

      {
        name: spec.name,
        version: spec.version.to_s,
        loaded_features: count,
      }
    end.sort_by { |entry| [-entry[:loaded_features], entry[:name]] }
  end

  def app_features
    $LOADED_FEATURES
      .select { |feature| feature.start_with?(ROOT.to_s) }
      .map { |feature| feature.delete_prefix("#{ROOT}/") }
      .sort
  end

  def memsize_by_type
    {
      string: ObjectSpace.memsize_of_all(String),
      array: ObjectSpace.memsize_of_all(Array),
      hash: ObjectSpace.memsize_of_all(Hash),
      class: ObjectSpace.memsize_of_all(Class),
      module: ObjectSpace.memsize_of_all(Module),
      regexp: ObjectSpace.memsize_of_all(Regexp),
      symbol: ObjectSpace.memsize_of_all(Symbol),
    }
  end

  def zeitwerk_dirs
    loaders = [Rails.autoloaders.main, Rails.autoloaders.once].compact
    normalize_paths(loaders.flat_map(&:dirs))
  rescue StandardError
    []
  end
end

BootReport.run
