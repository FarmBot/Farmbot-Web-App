module Api
  class AisController < Api::AbstractController
    include ActionController::Live

    EXPIRY = Rails.env.test? ? 0.seconds : 1.week
    THROTTLE_POLICY = ThrottlePolicy.new(name, min: 10, hour: 100, day: 200)

    def create
      inner_prompt = raw_json[:prompt]
      context_key = raw_json[:context_key]
      sequence_id = raw_json[:sequence_id]
      if sequence_id.nil?
        system_prompt = lua_system_prompt
        user_prompt = lua_user_prompt
      else
        remove_field = context_key == "title" ? "name" : context_key
        system_prompt = ""
        user_prompt = SEQUENCE_PROMPT_PREFIX \
          + " " + sequence_inner_prompts.fetch(context_key) \
          + " " + clean_sequence(sequence_celery_script, remove_field)
      end
      prompt = system_prompt + user_prompt
      # puts prompt
      puts "AI #{context_key} written prompt: #{inner_prompt}" unless Rails.env.test?
      puts "AI #{context_key} prompt length: #{prompt.length}" unless Rails.env.test?

      violation = THROTTLE_POLICY.violation_for(current_device.id)

      if violation
        puts "AI #{context_key} error: throttled" unless Rails.env.test?
        render json: { error: "Too many requests. Try again later." }, status: 403
      else
        THROTTLE_POLICY.track(current_device.id)
        response.headers["Content-Type"] = "text/event-stream"
        response.headers["Last-Modified"] = Time.now.httpdate
        result = make_request(system_prompt, user_prompt, response.stream)
        if !result.dig("error").nil?
          render json: result, status: 422
        end
      end
    ensure
      response.stream.close
    end

    private

    SEQUENCE_PROMPT_PREFIX = "Below is a sequence for controlling a FarmBot."

    def sequence_inner_prompts
      {
        "description" => "Write a concise description of the sequence body in " \
          "#{user.language}. Don't mention anything the sequence doesn't " \
          "explicitly perform. Use 75 words or less. Limit prose.",
        "color" => "Choose a color that best represents the primary concern " \
          "of the sequence.\nExamples:\n" \
          "- Red if concerned with removing weeds or error conditions\n" \
          "- Green if concerned with taking care of plants\n" \
          "- Yellow if concerned with lights\n" \
          "- Blue if concerned with watering\n" \
          "- Orange if concerned with warnings\n" \
          "- Purple if concerned with logic, " \
          "data manipulation, or using 3rd party APIs\n" \
          "- Pink if concerned with taking photos, detecting weeds, or " \
          "measuring soil height\n" \
          "- Gray if the sequence is neutral in its action or there is not " \
          "a clear primary concern\n" \
          "Limit prose and only return the color.",
        "title" => "Write a title for the sequence in #{user.language} " \
          "in 25 characters or less. Don't use the words \"FarmBot\", " \
          "\"Sequence\", or \"Script\" in the title. Limit prose.",
      }
    end

    def lua_system_prompt
      "You will be provided with the documentation for writing Lua scripts " \
      "that can control a FarmBot machine and interact with the FarmBot Web " \
      "App API. " \
      "#{instructions}\n" \
      "---\n" \
      "Documentation:\n" \
      "#{lua_function_docs}"
    end

    def lua_user_prompt
      "The user's FarmBot has the following Peripherals, Sensors, and Tools:\n" \
      "#{named_resources}\n" \
      "Define and use the `pin_number` values from the above JSON directly " \
      "in the code when necessary. " \
      "Peripherals can be turned on, turned off, and toggled using their pin_number, " \
      "(for example, to toggle a peripheral, use `toggle_pin(pin_number)`) " \
      "Sensors can be read using their pin_number, " \
      "and Tool objects can be fetched from the API by their id.\n" \
      "---\n" \
      "User prompt:\n" \
      "#{raw_json[:prompt]}\n" \
      "---\n" \
      "Instructions:\n" \
      "#{instructions}"
    end

    def instructions
      "Using only the functions available in the documentation " \
      "and the Lua standard library, write concise code that satisfies the " \
      "user's prompt. Comment the code in #{user.language}. " \
      "Limit prose and only return the commented code. " \
      "Do not write additional prose or information before or after " \
      "the commented code."
    end

    def make_request(system_prompt, user_prompt, stream)
      url = "https://api.openai.com/v1/chat/completions"
      context_key = raw_json[:context_key]
      lua_request = context_key == "lua"
      model_lua = ENV["OPENAI_MODEL_LUA"] || "gpt-3.5-turbo-16k"
      model_other = ENV["OPENAI_MODEL_OTHER"] || "gpt-3.5-turbo"
      payload = {
        "model" => lua_request ? model_lua : model_other,
        "messages" => [
          {role: "system", content: system_prompt},
          {role: "user", content: user_prompt},
        ],
        "temperature" => (ENV["OPENAI_API_TEMPERATURE"] || 1).to_f,
        "stream" => true,
      }.to_json
      begin
        conn = Faraday.new(
          url: "https://api.openai.com/v1/chat/completions",
          headers: {
            "Content-Type" => "application/json",
            "Authorization" => "Bearer #{ENV["OPENAI_API_KEY"]}",
          },
        )
        full = ""
        response = conn.post("") do |req|
          req.body = payload
          buffer = ""
          total = 0
          missed = false
          req.options.on_data = Proc.new do |chunk, size|
            buffer += chunk
            total += chunk.bytes.length
            diff = size - total
            if (diff != 0 && !missed) || Rails.env.test?
              puts "AI #{context_key} error: diff" \
                   " (#{size} - #{total} = #{diff})" unless Rails.env.test?
              current_device.tell("Response stream incomplete.", ["toast"], "warn")
              missed = true
            end
            boundary = buffer.index("\n\n")
            while not boundary.nil?
              data_str = buffer.slice(0, boundary)
              buffer = buffer.slice(boundary + 2, buffer.length)
              json_string = data_str.split("data: ")[1]
              data = JSON.parse(json_string)
              output = data["choices"][0]
              if output["finish_reason"].nil?
                content = output["delta"].dig("content") || ""
                full += content
                stream.write(content)
              else
                puts "AI #{context_key} result: #{full.to_json}"
                puts "AI #{context_key} finish reason:" \
                     " #{output["finish_reason"]}" unless Rails.env.test?
                stream.close
                return {}
              end
              boundary = buffer.index("\n\n")
            end
          end
        end
        {}
      rescue => exception
        puts "AI #{context_key} error:" \
             " (#{exception.message})" unless Rails.env.test?
        current_device.tell("Please try again", ["toast"], "error")
        stream.close
        return {"error" => {"message" => exception.message}}
      end
    end

    def sequences
      Sequence.where(device: current_device)
    end

    def sequence
      @sequence ||= sequences.find(raw_json[:sequence_id])
    end

    def sequence_celery_script
      @sequence_celery_script ||= Sequences::Show.run!(sequence: sequence)
    end

    def clean_sequence(sequence_cs, remove_field)
      cleaned = sequence_cs.except("created_at", "updated_at", remove_field)
      cleaned.to_json.gsub(/\s+/, " ").slice(0, 10000)
    end

    def user
      @user ||= User.find_by!(device: current_device)
    end

    def named_resources
      {
        peripherals: Peripheral.where(device: current_device)
          .map{ |p| { name: p.label, pin_number: p.pin } },
        sensors: Sensor.where(device: current_device)
          .map{ |s| { name: s.label, pin_number: s.pin } },
        tools: Tool.where(device: current_device)
          .map{ |t| { name: t.name, id: t.id } },
    }.to_json
    end

    PAGE_NAMES = [
      "advanced",
      "api",
      "configuration",
      "coordinates",
      "curves",
      "e-stop-and-unlock",
      "images",
      "jobs",
      "messages",
      "movements",
      "pins",
      "time",
      "tools",
      "uart",
      "variables",
    ]

    REMOVE = [
      "nothing for now",
    ]

    def page_url(page_name)
      "https://raw.githubusercontent.com/FarmBot-Docs/farmbot-developers/main/" \
      "v15/lua/functions/#{page_name}.md"
    end

    def get_page_data(page_name)
      url = page_url(page_name)
      begin
        URI.parse(url).open.read
      rescue SocketError => exception
        puts "AI Lua docs fetch error: #{exception.message}" unless Rails.env.test?
      end
    end

    def shorten_docs(docs)
      functions = docs.split("\n# ")
      keep = []
      for function_section in functions
        function_name = function_section.split("\n")[0] || ""
        if REMOVE.any? { |remove| function_name.start_with?(remove) }
          next
        end
        clean = function_section
          .split("\n").map{ |line| line.strip() }.join("\n")
          # .split("\n").filter{ |line| !line.start_with?("--") }.join("\n")
          .gsub(/\{%\ninclude callout.html([\s\S]*)content="/, " ")
          .gsub(/\"\n%}/, " ")
          .gsub(/\n\n/, "\n")
          .strip()
        keep.push("# " + clean)
      end
      keep.join("\n")
    end

    def get_docs()
      function_docs = ""
      for page_name in PAGE_NAMES
        page_data = get_page_data(page_name)
        if page_data.nil?
          return ""
        end
        page_content = page_data.split("---").slice(2, page_data.length).join("---")
        function_docs += page_content
      end
      short_docs = shorten_docs(function_docs)
      puts "AI Lua docs fetched: #{short_docs.length} characters" unless Rails.env.test?
      short_docs
    end

    def lua_function_docs
      Rails.cache.fetch("lua_function_docs_#{ENV["DOCS_CACHE_NUM"]}", expires_in: EXPIRY) do
        get_docs()
      end
    end

  end
end
