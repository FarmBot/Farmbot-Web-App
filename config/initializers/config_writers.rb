require_relative "../../app/lib/rmq_config_writer.rb"
# Some services do not use ENV vars as the configuration mechanism (I wish they
# would). To simplify setup for self-hosters, we perform magic in the background
# that converts ENV vars into config files. - RC
RmqConfigWriter.render
