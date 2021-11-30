require "./app/lib/celery_script/checker"

module Api
  # A controller that contains all of the helper methods and shared logic for
  # all API endpoints.
  class AbstractController < ApplicationController
    # This error is thrown when you try to use a non-JSON request body on an
    # endpoint that requires JSON.
    class OnlyJson < Exception; end

    class BadAuth < Exception
      attr_reader :error_hash

      def initialize(error_hash)
        @error_hash = error_hash
      end
    end

    TOO_MUCH_DATA = "The resource exceeds database limits. " \
    "Please reduce the amount of data stored in a single resource"
    STALE_RECORD = "Local data conflicts with remote data. " \
    "Resolve conflicts and again"
    ONLY_JSON = "This is a JSON API. Please use a _valid_ " \
    "JSON object or array. Validate JSON objects at https://jsonlint.com/"
    NULL = Gem::Version.new("0.0.0")
    NOT_JSON = "That request was not valid JSON. " \
    "Consider checking the request body with a JSON validator."
    NOT_FBOS = Gem::Version.new("999.999.999")
    IRRELEVANT_ROW_LOCK_FIELDS = [:updated_at, :created_at]
    CONSENT_REQUIRED = "all device users must agree to terms of service."
    OUT_OF_RANGE = "One of those numbers was too big/small. " \
    "If you need larger numbers, let us know."
    respond_to :json
    skip_before_action :verify_authenticity_token
    before_action :set_default_stuff
    before_action :raw_json, only: [:update, :create]
    before_action :maybe_enforce_row_lock, only: [:update]
    before_action :check_fbos_version
    before_action :authenticate_user!
    after_action :skip_set_cookies_header

    rescue_from(ActionController::RoutingError) { sorry "Not found", 404 }
    rescue_from(ActionDispatch::Http::Parameters::ParseError) { sorry NOT_JSON }
    rescue_from(ActiveModel::RangeError) { sorry OUT_OF_RANGE }
    rescue_from(ActiveRecord::RecordInvalid) { |exc| render json: { error: exc.message }, status: 422 }
    rescue_from(ActiveRecord::RecordNotFound) { |exc| sorry "Document not found.", 404 }
    rescue_from(ActiveRecord::ValueTooLong) { sorry "Please use reasonable lengths on string inputs" }
    rescue_from(BadAuth) { |err| render json: err.error_hash, status: 401 }
    rescue_from(CeleryScript::TypeCheckError) { |err| sorry err.message }
    rescue_from(Errors::Forbidden) { |exc| sorry("You can't perform that action. #{exc.message}", 403) }
    rescue_from(Errors::LegalConsent) { |exc| render json: { error: CONSENT_REQUIRED }, status: 451 }
    rescue_from(JSON::ParserError) { sorry NOT_JSON }
    rescue_from(JWT::VerificationError) { |e| auth_err }
    rescue_from(OnlyJson) { |e| sorry ONLY_JSON }
    rescue_from(PG::ProgramLimitExceeded) { sorry TOO_MUCH_DATA }
    rescue_from(User::AlreadyVerified) { sorry "Already verified.", 409 }

    def resource # OVERRIDE THIS IN CHILD
      nil
    end

    def stale_data?
      if resource
        updated_at = raw_json[:updated_at]
        if updated_at
          if resource.updated_at.as_json != updated_at
            # Allow row lock violations,
            # but only if the violation
            # changes 1 fields or less.
            # Changing more than one column
            # with an invalid `updated_at`
            # field is not allowed.
            diff_count = 0
            raw_json
              .except(*IRRELEVANT_ROW_LOCK_FIELDS)
              .slice(*resource.class.column_names.map(&:to_sym))
              .to_a
              .each do |(key, value)|
              if resource[key] != raw_json[key]
                diff_count += 1
              end
            end
            return true if diff_count > 1
          end
        end
      end
      return false
    end

    # If FarmBot OS goes offline for a very long time,
    # you don't want to corrupt user data with stale records.
    def maybe_enforce_row_lock
      if stale_data?
        name = resource.class.model_name.human.downcase
        msg = "Discarding stale #{name} record (#{resource.id})"
        current_device.delay.tell(msg, ["error"], "warn")
        render json: { stale_record: STALE_RECORD }, status: 409
      end
    end

    def default_serializer_options
      { root: false, user: current_user }
    end

    def maybe_paginate(collection)
      page = params[:page]
      per = params[:per]

      if page && per
        render json: collection.page(page).per(per)
      else
        render json: collection
      end
    end

    private

    def clean_expired_farm_events
      FarmEvents::CleanExpired.run!(device: current_device)
      # TODO: The app is leaking `Fragment` records, creating
      #       orphaned DB entries. This should be fixable via
      #       ActiveRecord config. Most likely a misconfiguration.
      #         - RC 4 OCT 19
      Fragment.remove_old_fragments_for_device(current_device)
    end

    # Rails 5 params are no longer simple hashes. This was for security reasons.
    # Our API does not do things the "Rails way" (we use Mutations for input
    # sanitation) so we can ignore this and grab the raw input.
    def raw_json
      @raw_json ||= parse_json
    rescue JSON::ParserError
      raise OnlyJson
    end

    def parse_json
      body = request.body.read
      json = body.present? ? JSON.parse(body, symbolize_names: true) : nil
      raise OnlyJson unless json.is_a?(Hash) || json.is_a?(Array)
      json
    end

    REQ_ID = "X-Farmbot-Rpc-Id"

    def set_default_stuff
      request.format = "json"
      id = request.headers[REQ_ID] || SecureRandom.uuid
      response.headers[REQ_ID] = id
      # IMPORTANT: We need to hoist X-Farmbot-Rpc-Id to a global so that it is
      #            accessible for use with auto sync.
      Transport.current.set_current_request_id(response.headers[REQ_ID])
    end

    # Disable cookies. This is an API!
    def skip_set_cookies_header
      reset_session
    end

    def authenticate_user!
      # All possible information that could be needed for any of the 3 auth
      # strategies.
      context = { jwt: request.headers["Authorization"],
                  user: current_user }
      # Returns a symbol representing the appropriate auth strategy, or nil if
      # unknown.
      strategy = Auth::DetermineAuthStrategy.run!(context)
      case strategy
      when :jwt
        sign_in(Auth::FromJwt.run!(context).require_consent!)
      when :already_connected
        # Probably provided a cookie.
        # 9 times out of 10, it's a unit test.
        # Our cookie system works, we just don't use it.
        current_user.require_consent!
        return true
      else
        auth_err
      end
      mark_as_seen
    rescue Mutations::ValidationException => e
      raise BadAuth, { error: e.errors.message.merge(strategy: strategy) }
    end

    def auth_err
      sorry("You failed to authenticate with the API. Ensure that you " \
            " provide a JSON Web Token in the `Authorization:` header.", 401)
    end

    def sorry(msg, status = 422)
      render json: { error: msg }, status: status
    end

    TPL = "FBOS received a 422 error %s ERRORS: %s PARAMS: %s"

    def mutate(outcome, options = {})
      if outcome.success?
        render options.merge(json: outcome.result)
      else
        e = outcome.errors.message
        when_farmbot_os do
          puts TPL % [
            e.to_json,
            params.to_json,
            self.class.inspect,
          ]
        end
        render options.merge(json: e, status: 422)
      end
    end

    EXPECTED_VER = Gem::Version::new(GlobalConfig.dump["MINIMUM_FBOS_VERSION"])

    def bad_version
      render json: { error: "Upgrade to latest FarmBot OS" }, status: 426
    end

    # Try to extract FarmBot OS version from user agent.
    def fbos_version
      ua = FbosDetector.pretty_ua(request)

      # Attempt 1:
      #   The device is using an HTTP client that does not provide a user-agent.
      #   We will assume this is an old FBOS version and set it to 0.0.0
      return NOT_FBOS if ua == FbosDetector::NO_UA_FOUND

      # Attempt 2:
      #   If the user agent was missing, we would have returned by now.
      #   If the UA includes FbosDetector::FARMBOT_UA_STRING at this point, we can be certain
      #   we have a have an FBOS client.
      if ua.include?(FbosDetector::FARMBOT_UA_STRING)
        return Gem::Version::new(ua[10, 12].split(" ").first)
      else
        # Attempt 3:
        #   Pass NOT_FBOS if all other attempts fail.
        return NOT_FBOS
      end
    end

    # This is how we lock old versions of FBOS out of the API:
    def check_fbos_version
      when_farmbot_os do
        bad_version unless fbos_version >= EXPECTED_VER
      end
    end

    def is_fbos?
      FbosDetector.pretty_ua(request).include?(FbosDetector::FARMBOT_UA_STRING)
    end

    # Conditionally execute a block when the request was made by a FarmBot
    def when_farmbot_os
      yield if is_fbos?
    end

    # Devices have a `last_saw_api` field to assist users with debugging.
    # We update this column every time an FBOS device talks to the API.
    def mark_as_seen(bot = (current_user && current_user.device))
      when_farmbot_os do
        if bot
          v = fbos_version
          bot.last_saw_api = Time.now
          # Do _not_ set the FBOS version to 0.0.0 if the UA header is missing.
          if v > NULL && v < NOT_FBOS
            bot.fbos_version = (v.to_s || "").first(17)
            bot.save!
          end
        end
      end
    end
  end
end
